//================================================================================
//
// (c) Copyright China Digital Video (Beijing) Limited, 2020. All rights reserved.
//
// This code and information is provided "as is" without warranty of any kind,
// either expressed or implied, including but not limited to the implied
// warranties of merchantability and/or fitness for a particular purpose.
//
//--------------------------------------------------------------------------------
//   Birth Date:    Mar 05. 2020
//   Author:        Meishe video team
//================================================================================
class NvsAudioOutputWorkletProcessor extends AudioWorkletProcessor {
    constructor (options) {
        super();

        this.channelCount = options.processorOptions.channelCount;
        this.heap32 = options.processorOptions.heap32;
        this.heapf32 = options.processorOptions.heapf32;
        this.statePtrIdx = options.processorOptions.statePtr >> 2;
        this.resettingPtrIdx = options.processorOptions.resettingPtr >> 2;
        this.ringBufferStartIndexPtrIdx = options.processorOptions.ringBufferStartIndexPtr >> 2;
        this.ringBufferEndIndexPtrIdx = options.processorOptions.ringBufferEndIndexPtr >> 2;
        this.ringBufferHeaderPtrIdx = options.processorOptions.ringBufferHeaderPtr >> 2;
        this.ringBufferHeaderSizeIntCount = options.processorOptions.ringBufferHeaderSize >> 2;
        this.ringBufferPtrIdx = options.processorOptions.ringBufferPtr >> 2;
        this.ringBufferSizeFloatCount = options.processorOptions.ringBufferSize >> 2;
        this.ringBufferCount = options.processorOptions.ringBufferCount;
        this.ringBufferPendingSampleCountPtrIdx = options.processorOptions.ringBufferPendingSampleCountPtr >> 2;
    }

    process (inputs, outputs, parameters) {
        // take the first output
        const output = outputs[0];
        console.assert(output.length === this.channelCount, 'Channel count mismatch!');

        let startIndex = Atomics.load(this.heap32, this.ringBufferStartIndexPtrIdx);
        const endIndex = Atomics.load(this.heap32, this.ringBufferEndIndexPtrIdx);
        const indexPeriod = this.ringBufferCount * 2;
        const bufCount = endIndex >= startIndex ? (endIndex - startIndex) : (endIndex + indexPeriod - startIndex);
        console.assert(bufCount <= this.ringBufferCount, 'Invalid audio buffer count!');

        if (bufCount === 0)
            return true; // NOTE: output buffer has aready been initialized to zeros by audio worklet

        if (Atomics.load(this.heap32, this.resettingPtrIdx)) {
            // Audio output is reseting, drop all audio ring buffers
            for (let i = 0; i < bufCount; ++i) {
                const bufIdx = (startIndex + i) % this.ringBufferCount;
                const sampleCountPtrIdx = this.ringBufferHeaderPtrIdx + this.ringBufferHeaderSizeIntCount * bufIdx;
                Atomics.sub(this.heap32, this.ringBufferPendingSampleCountPtrIdx, this.heap32[sampleCountPtrIdx]);
                this.heap32[sampleCountPtrIdx] = 0;
            }

            Atomics.store(this.heap32, this.ringBufferStartIndexPtrIdx, endIndex);
            Atomics.store(this.heap32, this.resettingPtrIdx, 0);
            return true;
        }

        let sampleCountFilled = 0;
        if (Atomics.load(this.heap32, this.statePtrIdx) !== 2/* NvAudioOutputState_StoppedState */) {
            //
            // Fill audio samples to output
            //
            for (let i = 0; i < bufCount; ++i) {
                const curBufIdx = startIndex % this.ringBufferCount;
                const bufSampleCountPtrIdx = this.ringBufferHeaderPtrIdx + curBufIdx * this.ringBufferHeaderSizeIntCount;
                const sampleCountToCopy = Math.min(128 - sampleCountFilled, this.heap32[bufSampleCountPtrIdx]);
                const curBufPtrIdx = this.ringBufferPtrIdx + this.ringBufferSizeFloatCount * curBufIdx;
                for (let ch = 0; ch < this.channelCount; ++ch) {
                    let outputChannel = output[ch];
                    for (let k = 0; k < sampleCountToCopy; ++k) {
                        const curBufChannelPtrIdx = curBufPtrIdx + ch;
                        outputChannel[sampleCountFilled + k] = this.heapf32[curBufChannelPtrIdx + k * this.channelCount];
                    }
                }

                sampleCountFilled += sampleCountToCopy;
                this.heap32[bufSampleCountPtrIdx] -= sampleCountToCopy;
                Atomics.sub(this.heap32, this.ringBufferPendingSampleCountPtrIdx, sampleCountToCopy);

                // Update audio ring buffer start index
                if (this.heap32[bufSampleCountPtrIdx] === 0) {
                    startIndex = (startIndex + 1) % indexPeriod;
                } else {
                    const sampleCountToMove = this.heap32[bufSampleCountPtrIdx];
                    const startFloatIndexToMove = sampleCountToCopy * this.channelCount;
                    const floatCountToMove = sampleCountToMove * this.channelCount;
                    for (let k = 0; k < floatCountToMove; ++k)
                        this.heapf32[curBufPtrIdx + k] = this.heapf32[curBufPtrIdx + startFloatIndexToMove + k];
                }
                Atomics.store(this.heap32, this.ringBufferStartIndexPtrIdx, startIndex);

                if (sampleCountFilled === 128)
                    break;
            }

            if (sampleCountFilled)
                Atomics.store(this.heap32, this.statePtrIdx, 0/* NvAudioOutputState_ActiveState */);
            else
                Atomics.store(this.heap32, this.statePtrIdx, 3/* NvAudioOutputState_IdleState */);
        } else {
            // Audio output is stopped, here we must drop all ring audio buffers or otherwise
            // the next time we start audio output the residuary audio buffers
            // will be playbacked which will cause jerky sound
            for (let i = 0; i < bufCount; ++i) {
                const bufIdx = (startIndex + i) % this.ringBufferCount;
                const sampleCountPtrIdx = this.ringBufferHeaderPtrIdx + this.ringBufferHeaderSizeIntCount * bufIdx;
                Atomics.sub(this.heap32, this.ringBufferPendingSampleCountPtrIdx, this.heap32[sampleCountPtrIdx]);
                this.heap32[sampleCountPtrIdx] = 0;
            }

            Atomics.store(this.heap32, this.ringBufferStartIndexPtrIdx, endIndex);
        }

        return true;
    }
}

registerProcessor('meishe-audio-output-processor', NvsAudioOutputWorkletProcessor)
