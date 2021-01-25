<template>
  <div>
    {{ $t("hello") }}
    <h1>
    {{ $t("h") }}
    </h1>
  </div>
</template>

<script>
export default {
  name: "HelloI18n"
};
</script>

<i18n>
{
  "en": {
    "hello": "Hello i18n in SFC!",
    "h": "213132"
  }
}
</i18n>
