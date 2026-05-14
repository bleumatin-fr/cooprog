import styled from "@emotion/styled";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";

const Container = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;

  hr {
    border: none;
    border-bottom: 1px solid #e0e0e0;
  }

  em {
    font-size: 0.8rem;
    display: block;
    text-align: center;
  }

  ol,
  ul {
    margin-left: 32px;

    li {
      // margin-bottom: 8px;
    }
  }

  h3:not(:first-child) {
    margin-top: 16px;
  }
`;

interface MarkdownProps extends Options {
  style?: React.CSSProperties;
  className?: string;
}

const Markdown = ({ children, className, style, ...other }: MarkdownProps) => {
  return (
    <Container className={className} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkGemoji]} {...other}>
        {children}
      </ReactMarkdown>
    </Container>
  );
};

export default Markdown;
