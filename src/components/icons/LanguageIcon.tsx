import { Icon } from "@iconify/react";
import { Tooltip } from "@mui/material";

export const LanguageIcon: React.FC<{
  language: string | null | undefined;
  size?: number;
}> = ({ language, size }) => {
  const icons = {
    TypeScript: "typescript",
    JavaScript: "javascript",
    Python: "python-light",
    Ruby: "ruby",
    Java: "java-light",
    "C++": "cpp",
    Shell: "bash-light",
    HTML: "html",
    CSS: "css",
    Dart: "dart-light",
    Groovy: "vscode-icons:file-type-groovy",
    Puppet: "vscode-icons:file-type-puppet",
    Scala: "scala-light",
    "Vim script": "vim-light",
    Elixir: "elixir-light",
    Dockerfile: "docker",
    "Objective-C": "file-type-objectivec",
    PLSQL: "file-type-plsql",
    HCL: "terraform-light",
  } as Record<string, string>;

  const icon = icons[language ?? ""] || "github-light";

  return (
    <Tooltip title={language ?? "Unknown"} placement="top">
      <Icon
        icon={icon.includes(":") ? icon : `skill-icons:${icon}`}
        height={size ?? 16}
        width={size ?? 16}
      />
    </Tooltip>
  );
};
