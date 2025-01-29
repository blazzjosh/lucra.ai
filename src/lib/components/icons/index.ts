import type { SvelteComponent } from "svelte";
import Google from "./google.svelte";
import Yahoo from "./yahoo.svelte";
import Outlook from "./outlook.svelte";


// lucide icons
import  ChartNoAxesColumnIncreasing from 'lucide-svelte/icons/chart-no-axes-column-increasing'; 
import  File from 'lucide-svelte/icons/file'; 
import  Globe from 'lucide-svelte/icons/globe'; 
import  HeartHandshake from 'lucide-svelte/icons/heart-handshake'; 
import  Rss from 'lucide-svelte/icons/rss'; 
import  Shield from 'lucide-svelte/icons/shield'; 
import  ChevronRight from 'lucide-svelte/icons/chevron-right'; 
import  ArrowRight from 'lucide-svelte/icons/arrow-right'; 
import  Moon from 'lucide-svelte/icons/moon'; 
import  Sun from 'lucide-svelte/icons/sun'; 

export type Icon  = SvelteComponent;


export const Icons = {
    Google,
    Yahoo,
    Outlook,
    ChartNoAxesColumnIncreasing,
    File,
    Globe,
    HeartHandshake,
    Rss,
    Shield,
    ChevronRight,
    ArrowRight,
    Moon,
    Sun,
}