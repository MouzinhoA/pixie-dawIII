export const CHAVE_TEMA = "pixie-tema"

export const SCRIPT_TEMA_INICIAL = `(function(){try{var t=localStorage.getItem("${CHAVE_TEMA}");if(t==="escuro"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
