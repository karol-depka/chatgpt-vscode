### Repo-wide prompt with relevant files - reduce cognitive load

"i wanna change the configuration section title in my vscode extension, to "chatGPT - MetaPrompt".
-=-=-=
Which files should I give You for that task? 
(just list of files with full paths, in machine-readble format; glob/recursive-glob if multiple files; no explanations)"


-=-=-=
Print full file(s) contents. With full path(s) before each file contents.

###
Print .patch compared to my original version.
Print .diff that I can automatically apply compared to my original version.


#### Making commits:
Given this git diff, generate script to make commits with good titles based on the changes:
Prefix each commit title with "ChatGPTCommit: ".
Just give me the script. Use single quotes around filenames and commit messages.

The diff:
```