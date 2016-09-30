import {isatty} from "tty";

export const prettyPrint: boolean = isatty(1) && isatty(2);
