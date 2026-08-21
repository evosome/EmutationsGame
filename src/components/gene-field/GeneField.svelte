<script lang="ts">
  import { formatSeed } from "$utils/index";

  const MAX_GENE_LENGHT = 15;
  const COMMON_GENE_PLACEHOLDER = "XXX-XXX-XXX-XXX";

  interface GenFieldProps {
    placeholder?: string;
    value?: string;
  }

  let {
    placeholder = COMMON_GENE_PLACEHOLDER,
    value = $bindable(""),
  }: GenFieldProps = $props();
  let input: HTMLInputElement;

  function handleInput() {
    if (input) {
      const formatted = formatSeed(input.value);
      value = formatted;
      input.value = formatted;
    }
  }

  function focus() {
    input?.focus();
  }

  export { focus };
</script>

<div class="gen-field">
  <input
    bind:this={input}
    bind:value
    type="text"
    class="gen-field__input"
    {placeholder}
    oninput={handleInput}
    maxlength={MAX_GENE_LENGHT}
  />
</div>

<style>
  .gen-field {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gen-field__input {
    font-family: "Inter", system-ui, sans-serif;
    font-size: 16px;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    background: #fff;
    color: #000;
    text-align: center;
    letter-spacing: 1px;
    width: 100%;
    min-width: 120px;
    outline: none;
    transition: border-color 0.2s;
  }

  .gen-field__input:focus {
    border-color: #aa3bff;
  }

  .gen-field__input::placeholder {
    color: #ccc;
    letter-spacing: 1px;
  }
</style>
