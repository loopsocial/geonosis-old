var Module = {}

function WASMLoader(config)
{
    function webAssemblySupported() {
        return typeof WebAssembly !== "undefined"
    }

    function webGLSupported() {
        // We expect that WebGL is supported if WebAssembly is; however
        // the GPU may be blacklisted.
        try {
            var canvas = document.createElement("canvas");
            return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
        } catch (e) {
            return false;
        }
    }

    config.restartMode = config.restartMode || "DoNotRestart";
    config.restartLimit = config.restartLimit || 10;

    if (config.stdoutEnabled === undefined) config.stdoutEnabled = true;
    if (config.stderrEnabled === undefined) config.stderrEnabled = true;

    // Make sure config.path is defined and ends with "/" if needed
    if (config.path === undefined)
        config.path = "";
    if (config.path.length > 0 && !config.path.endsWith("/"))
        config.path = config.path.concat("/");

    if (config.environment === undefined)
        config.environment = {};

    var publicAPI = {};
    publicAPI.status = undefined;
    publicAPI.loadEmscriptenModule = loadEmscriptenModule;

    restartCount = 0;

    function fetchResource(filePath) {
        var fullPath = config.path + filePath;
        return fetch(fullPath).then(function(response) {
            if (!response.ok) {
                self.error = response.status + " " + response.statusText + " " + response.url;
                setStatus("Error");
                return Promise.reject(self.error)
            } else {
                return response;
            }
        });
    }

    function fetchText(filePath) {
        return fetchResource(filePath).then(function(response) {
            return response.text();
        });
    }

    function fetchThenCompileWasm(response) {
        return response.arrayBuffer().then(function(data) {
            self.loaderSubState = "Compiling";
            setStatus("Loading") // trigger loaderSubState udpate
            return WebAssembly.compile(data);
        });
    }

    function fetchCompileWasm(filePath) {
        return fetchResource(filePath).then(function(response) {
            if (typeof WebAssembly.compileStreaming !== "undefined") {
                self.loaderSubState = "Downloading/Compiling";
                setStatus("Loading");
                return WebAssembly.compileStreaming(response).catch(function(error) {
                    // compileStreaming may/will fail if the server does not set the correct
                    // mime type (application/wasm) for the wasm file. Fall back to fetch,
                    // then compile in this case.
                    return fetchThenCompileWasm(response);
                });
            } else {
                // Fall back to fetch, then compile if compileStreaming is not supported
                return fetchThenCompileWasm(response);
            }
        });
    }

    function loadEmscriptenModule(applicationName) {
        // Check for Wasm & WebGL support; set error and return before downloading resources if missing
        if (!webAssemblySupported()) {
            self.error = "Error: WebAssembly is not supported"
            setStatus("Error");
            return;
        }
        if (!webGLSupported()) {
            self.error = "Error: WebGL is not supported"
            setStatus("Error");
            return;
        }

        // Continue waiting if loadEmscriptenModule() is called again
        if (publicAPI.status == "Loading")
            return;
        self.loaderSubState = "Downloading";
        setStatus("Loading");

        // Fetch emscripten generated javascript runtime
        var emscriptenModuleSource = undefined
        var emscriptenModuleSourcePromise = fetchText(applicationName + ".js").then(function(source) {
            emscriptenModuleSource = source
        });

        // Fetch and compile wasm module
        var wasmModule = undefined;
        var wasmModulePromise = fetchCompileWasm(applicationName + ".wasm").then(function (module) {
            wasmModule = module;
        });

        // Wait for all resources ready
        Promise.all([emscriptenModuleSourcePromise, wasmModulePromise]).then(function(){
            completeLoadEmscriptenModule(applicationName, emscriptenModuleSource, wasmModule);
        }).catch(function(error) {
            self.error = error;
            setStatus("Error");
        });
    }

    function completeLoadEmscriptenModule(applicationName, emscriptenModuleSource, wasmModule) {
        // The wasm binary has been compiled into a module during resource download,
        // and is ready to be instantiated. Define the instantiateWasm callback which
        // emscripten will call to create the instance.
        Module.instantiateWasm = function(imports, successCallback) {
            WebAssembly.instantiate(wasmModule, imports).then(function(instance) {
                successCallback(instance, wasmModule);
            }, function(error) {
                self.error = error;
                setStatus("Error");
            });
            return {};
        };

        Module.locateFile = Module.locateFile || function(filename) {
            return config.path + filename;
        };

        // Attach status callbacks
        Module.setStatus = Module.setStatus || function(text) {
            // Currently the only usable status update from this function
            // is "Running..."
            if (text.startsWith("Running"))
                setStatus("Running");
        };
        Module.monitorRunDependencies = Module.monitorRunDependencies || function(left) {
          //  console.log("monitorRunDependencies " + left)
        };

        // Attach standard out/err callbacks.
        Module.print = Module.print || function(text) {
            if (config.stdoutEnabled)
                console.log(text)
        };
        Module.printErr = Module.printErr || function(text) {
            if (text.startsWith !== undefined && text.startsWith("bad name in getProcAddress:"))
                return;

            if (config.stderrEnabled)
                console.log(text)
        };

        // Error handling: set status to "Exited", update crashed and
        // exitCode according to exit type.
        // Emscripten will typically call printErr with the error text
        // as well. Note that emscripten may also throw exceptions from
        // async callbacks. These should be handled in window.onerror by user code.
        Module.onAbort = Module.onAbort || function(text) {
            publicAPI.crashed = true;
            publicAPI.exitText = text;
            setStatus("Exited");
        };
        Module.quit = Module.quit || function(code, exception) {
            if (exception.name == "ExitStatus") {
                // Clean exit with code
                publicAPI.exitText = undefined
                publicAPI.exitCode = code;
            } else {
                publicAPI.exitText = exception.toString();
                publicAPI.crashed = true;
            }
            setStatus("Exited");
        };

        // Set environment variables
        Module.preRun = Module.preRun || []
        Module.preRun.push(function() {
            for (var [key, value] of Object.entries(config.environment)) {
                ENV[key.toUpperCase()] = value;
            }
        });

        Module.mainScriptUrlOrBlob = new Blob([emscriptenModuleSource], {type: 'text/javascript'});

        config.restart = function() {

            // Restart by reloading the page. This will wipe all state which means
            // reload loops can't be prevented.
            if (config.restartType == "ReloadPage") {
                location.reload();
            }

            // Restart by readling the emscripten app module.
            ++self.restartCount;
            if (self.restartCount > config.restartLimit) {
                self.error = "Error: This application has crashed too many times and has been disabled. Reload the page to try again."
                setStatus("Error");
                return;
            }
            loadEmscriptenModule(applicationName);
        };

        publicAPI.exitCode = undefined;
        publicAPI.exitText = undefined;
        publicAPI.crashed = false;

        // Finally evaluate the emscripten application script, which will
        // reference the global Module object created above.
        self.eval(emscriptenModuleSource); // ES5 indirect global scope eval
    }

    function notifyError() {
        if (config.containerElements === undefined) {
            if (config.showError !== undefined)
                config.showError(self.error);
            return;
        }

        for (container of config.containerElements) {
            var errorElement = config.showError(self.error, container);
            container.appendChild(errorElement);
        }
    }

    function notifyStatus() {
        if (config.containerElements === undefined) {
            if (config.showLoader !== undefined)
                config.showLoader(self.loaderSubState);
            return;
        }

        for (container of config.containerElements) {
            var loaderElement = config.showLoader(self.loaderSubState, container);
            container.appendChild(loaderElement);
        }
    }

    function notifyFinish() {
        if (config.containerElements === undefined) {
            if (config.loadingFinished !== undefined)
                config.loadingFinished();
            return;
        }
    }

    function setExitContent() {
        if (publicAPI.status != "Exited")
            return;

        if (config.containerElements === undefined) {
            if (config.showExit !== undefined)
                config.showExit(publicAPI.crashed, publicAPI.exitCode);
            return;
        }

        if (!publicAPI.crashed)
            return;

        for (container of config.containerElements) {
            var loaderElement = config.showExit(publicAPI.crashed, publicAPI.exitCode, container);
            if (loaderElement !== undefined)
                container.appendChild(loaderElement);
        }
    }

    var committedStatus = undefined;
    function handleStatusChange() {
        if (publicAPI.status != "Loading" && committedStatus == publicAPI.status)
            return;
        committedStatus = publicAPI.status;

        if (publicAPI.status == "Error") {
            notifyError();
        } else if (publicAPI.status == "Loading") {
            notifyStatus();
        } else if (publicAPI.status == "Running") {
            notifyFinish();
        } else if (publicAPI.status == "Exited") {
            if (config.restartMode == "RestartOnExit" ||
                config.restartMode == "RestartOnCrash" && publicAPI.crashed) {
                    committedStatus = undefined;
                    config.restart();
            } else {
                setExitContent();
            }
        }

        // Send status change notification
        if (config.statusChanged)
            config.statusChanged(publicAPI.status);
    }

    function setStatus(status) {
        if (status != "Loading" && publicAPI.status == status)
            return;
        publicAPI.status = status;

        window.setTimeout(function() { handleStatusChange(); }, 0);
    }

    setStatus("Created");

    return publicAPI;
}
