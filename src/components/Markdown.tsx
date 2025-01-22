import { Link } from "@mui/material";
import MarkdownRenderer from "react-markdown";

export type MarkdownProps = {
  content: string;
};

export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  return (
    <MarkdownRenderer
      components={{
        img: (props) => (
          <Link
            href={props.src as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              {...props}
              style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }}
              loading="lazy"
            />
          </Link>
        ),
        a: (props) => (
          <Link
            href={props.href as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.children}
          </Link>
        ),
      }}
    >
      {content}
    </MarkdownRenderer>
  );
};
