#!/usr/bin/env node
import fs from "fs";
import path from "path";
import beautify from "js-beautify";
import chalk from "chalk";
import { program } from "commander";

// Define the version of the package
program.version("1.0.1"); // This will handle the -v and --version flags automatically

// Default action (beautify the files in the given directory or current directory)
program
  .arguments("[directory]")
  .description("Beautify files in the specified directory")
  .action((directory) => {
    // Use the directory provided as an argument or the current directory
    const targetDirectory = directory || process.cwd();

    // Function to beautify a file
    const beautifyFile = (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const content = fs.readFileSync(filePath, "utf-8");
      let beautifiedContent;

      try {
        if (ext === ".js") {
          beautifiedContent = beautify.js(content, { indent_size: 2 });
        } else if (ext === ".css") {
          beautifiedContent = beautify.css(content, { indent_size: 2 });
        } else if (ext === ".html" || ext === ".htm") {
          beautifiedContent = beautify.html(content, { indent_size: 2 });
        } else if (ext === ".php") {
          const phpParts = content.split(/(<\?php.*?\?>)/g); // Split PHP tags
          const htmlContent = phpParts
            .filter((part) => !part.startsWith("<?php"))
            .join("");
          const beautifiedHTML = beautify.html(htmlContent, { indent_size: 2 });
          beautifiedContent = phpParts
            .map((part) => {
              if (part.startsWith("<?php")) {
                return part; // Keep PHP code intact
              } else {
                return beautifiedHTML; // Replace HTML with beautified HTML
              }
            })
            .join("");
        } else {
          console.log(
            chalk.yellow(`Skipping non-beautifiable file: ${filePath}`)
          );
          return;
        }

        fs.writeFileSync(filePath, beautifiedContent, "utf-8");
        console.log(chalk.green(`Beautified file: ${filePath}`));
      } catch (err) {
        console.error(
          chalk.red(`Failed to beautify ${filePath}: ${err.message}`)
        );
      }
    };

    // Read the directory and process each file
    fs.readdirSync(targetDirectory).forEach((file) => {
      const filePath = path.join(targetDirectory, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        beautifyFile(filePath);
      }
    });
  });

// Parse the arguments
program.parse(process.argv);
