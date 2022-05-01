module baffler;

import core.stdc.stdlib;
import std.stdio;
import std.file;

string color(string text, string number = "31") { 
    return "\x1b["~number~"m"~text~"\x1b[0m";
}

string read(string[] args) {
    if (args.length <= 1) { writeln(
        color("Error")~" { module/"~color("stdio", "32")~" } Expected a filename"
    ); exit(1); }

    return readText(args[1]);
}