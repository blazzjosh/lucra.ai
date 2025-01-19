import type { SvelteComponent } from "svelte";
import Google from "./google.svelte";
import Yahoo from "./yahoo.svelte";
import Outlook from "./outlook.svelte";


export type Icon  = SvelteComponent;


export const Icons = {
    Google,
    Yahoo,
    Outlook,
}