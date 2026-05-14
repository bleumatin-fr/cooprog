import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import styled from "@emotion/styled";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
} from "@mui/icons-material";
import { useTranslation } from "next-i18next";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
}

const EditorContainer = styled(Box)`
  border: 1px solid
    ${({ error }: { error?: boolean }) =>
      error ? "var(--error-background-color)" : "var(--color-light-gray)"};
  border-radius: 4px;
  background-color: var(--color-white);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ error }: { error?: boolean }) =>
      error ? "var(--error-background-color)" : "var(--color-gray)"};
  }

  &:focus-within {
    border-color: var(--color-orange) !important;
    border-width: 2px;
  }
`;

const ToolbarContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 2px solid var(--color-light-gray);
  background-color: var(--color-very-light-gray);
  flex-wrap: wrap;
  border-radius: 4px 4px 0 0;

  div:focus-within > & {
    padding: 11px 15px 12px 15px;
  }
`;

const ContentContainer = styled(Box)`
  padding: 20px 16px;
  min-height: 120px;
  outline: none;
  background-color: var(--color-white);
  border-radius: 0 0 4px 4px;

  div:focus-within > & {
    padding: 20px 15px 19px 15px;
  }

  .ProseMirror {
    outline: none;
    min-height: 88px;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    color: var(--color-text-gray);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .ProseMirror h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
  }

  .ProseMirror h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem 0;
  }

  .ProseMirror h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0.5rem 0 0.25rem 0;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .ProseMirror li {
    margin: 0.25rem 0;
  }

  .ProseMirror blockquote {
    border-left: 3px solid var(--color-light-gray);
    margin: 0.5rem 0;
    padding-left: 1rem;
    font-style: italic;
    color: var(--color-text-gray);
  }

  .ProseMirror code {
    background-color: var(--color-very-light-gray);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.875rem;
  }

  .ProseMirror pre {
    background-color: var(--color-very-light-gray);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  .ProseMirror pre code {
    background-color: transparent;
    padding: 0;
  }

  /* Custom styling for server placeholders */
  .ProseMirror .server-placeholder {
    background-color: var(--color-orange);
    color: var(--color-white);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.875rem;
    font-family: monospace;
    font-weight: 500;
    margin: 0 2px;
    display: inline-block;
    cursor: help;
  }

  /* Style for {{link}} placeholder specifically */
  .ProseMirror {
    font-family: inherit;
  }

  /* Make {{link}} placeholder look like a pill */
  .ProseMirror:not(.ProseMirror-focused) {
    color: var(--color-text-gray);
  }

  /* Style for placeholder text to look like pills */
  .ProseMirror {
    font-family: inherit;
  }

  /* Make {{link}} placeholder look like a pill */
  .ProseMirror:not(.ProseMirror-focused) {
    color: var(--color-text-gray);
  }

  /* Highlight placeholder text */
  .ProseMirror p {
    position: relative;
  }

  /* Direct styling for placeholder text in editor */
  .ProseMirror {
    font-family: inherit;
  }

  /* Make {{link}} placeholder look like a pill */
  .ProseMirror:not(.ProseMirror-focused) {
    color: var(--color-text-gray);
  }

  /* Highlight placeholder text */
  .ProseMirror p {
    position: relative;
  }

  /* Style placeholder text directly in the editor */
  .ProseMirror {
    font-family: inherit;
  }
`;

const StyledToggleButton = styled(ToggleButton)`
  min-width: 40px;
  height: 32px;
  padding: 4px;
  border-radius: 4px;
  background-color: var(--color-white);
  color: var(--color-dark-green);

  &:hover {
    background-color: var(--color-very-light-gray);
  }

  &.Mui-selected {
    background-color: var(--color-orange);
    color: var(--color-white);

    &:hover {
      background-color: var(--color-orange);
    }
  }

  &.Mui-disabled {
    opacity: 0.5;
    background-color: var(--color-very-light-gray);
  }
`;

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  disabled = false,
  error = false,
  helperText,
  label,
}) => {
  const { t } = useTranslation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        "data-placeholder": placeholder,
      },
    },
    parseOptions: {
      preserveWhitespace: "full",
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const isActive = (name: string, attributes?: Record<string, any>) => {
    if (attributes) {
      return editor.isActive(name, attributes);
    }
    return editor.isActive(name);
  };

  const isTextAlignActive = (align: string) => {
    return editor.isActive({ textAlign: align });
  };

  const toggleMark = (name: string, attributes?: Record<string, any>) => {
    if (attributes) {
      editor.chain().focus().toggleMark(name, attributes).run();
    } else {
      editor.chain().focus().toggleMark(name).run();
    }
  };

  const toggleNode = (name: string, attributes?: Record<string, any>) => {
    if (attributes) {
      editor.chain().focus().toggleNode(name, "paragraph", attributes).run();
    } else {
      editor.chain().focus().toggleNode(name, "paragraph").run();
    }
  };

  const setTextAlign = (align: string) => {
    editor.chain().focus().setTextAlign(align).run();
  };

  return (
    <Box sx={{ width: "100%" }}>
      {label && (
        <Box
          component="label"
          sx={{
            display: "block",
            fontSize: "0.875rem",
            marginBottom: "8px",
            color: error
              ? "var(--error-background-color)"
              : "var(--color-dark-green)",
            fontWeight: 500,
          }}
        >
          {label}
        </Box>
      )}

      <EditorContainer error={error}>
        <ToolbarContainer>
          <ToggleButtonGroup
            size="small"
            aria-label={t("common:richtext-editor.text-formatting-tooltip")}
            sx={{
              "& .MuiToggleButtonGroup-grouped": {
                border: "1px solid var(--color-light-gray) !important",
                margin: "0 !important",
                "&:not(:first-of-type)": {
                  borderLeft: "1px solid var(--color-light-gray) !important",
                },
                "&:hover": {
                  border: "1px solid var(--color-gray) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-gray) !important",
                  },
                },
                "&.Mui-selected": {
                  border: "1px solid var(--color-orange) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-orange) !important",
                  },
                },
                "&.Mui-selected:hover": {
                  border: "1px solid var(--color-orange) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-orange) !important",
                  },
                },
              },
            }}
          >
            <Tooltip title={t("common:richtext-editor.bold-tooltip")}>
              <StyledToggleButton
                value="bold"
                selected={isActive("bold")}
                onClick={() => toggleMark("bold")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.bold-tooltip")}
              >
                <FormatBold fontSize="small" />
              </StyledToggleButton>
            </Tooltip>

            <Tooltip title={t("common:richtext-editor.italic-tooltip")}>
              <StyledToggleButton
                value="italic"
                selected={isActive("italic")}
                onClick={() => toggleMark("italic")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.italic-tooltip")}
              >
                <FormatItalic fontSize="small" />
              </StyledToggleButton>
            </Tooltip>

            <Tooltip title={t("common:richtext-editor.underline-tooltip")}>
              <StyledToggleButton
                value="underline"
                selected={isActive("underline")}
                onClick={() => toggleMark("underline")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.underline-tooltip")}
              >
                <FormatUnderlined fontSize="small" />
              </StyledToggleButton>
            </Tooltip>

            <Tooltip title={t("common:richtext-editor.strikethrough-tooltip")}>
              <StyledToggleButton
                value="strike"
                selected={isActive("strike")}
                onClick={() => toggleMark("strike")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.strikethrough-tooltip")}
              >
                <FormatStrikethrough fontSize="small" />
              </StyledToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ margin: "0 8px" }} />

          <ToggleButtonGroup
            size="small"
            aria-label="text alignment"
            sx={{
              "& .MuiToggleButtonGroup-grouped": {
                border: "1px solid var(--color-light-gray) !important",
                margin: "0 !important",
                "&:not(:first-of-type)": {
                  borderLeft: "1px solid var(--color-light-gray) !important",
                },
                "&:hover": {
                  border: "1px solid var(--color-gray) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-gray) !important",
                  },
                },
                "&.Mui-selected": {
                  border: "1px solid var(--color-orange) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-orange) !important",
                  },
                },
                "&.Mui-selected:hover": {
                  border: "1px solid var(--color-orange) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-orange) !important",
                  },
                },
              },
            }}
          >
            <Tooltip title={t("common:richtext-editor.align-left-tooltip")}>
              <StyledToggleButton
                value="left"
                selected={isTextAlignActive("left")}
                onClick={() => setTextAlign("left")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.align-left-tooltip")}
              >
                <FormatAlignLeft fontSize="small" />
              </StyledToggleButton>
            </Tooltip>

            <Tooltip title={t("common:richtext-editor.align-center-tooltip")}>
              <StyledToggleButton
                value="center"
                selected={isTextAlignActive("center")}
                onClick={() => setTextAlign("center")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.align-center-tooltip")}
              >
                <FormatAlignCenter fontSize="small" />
              </StyledToggleButton>
            </Tooltip>

            <Tooltip title={t("common:richtext-editor.align-right-tooltip")}>
              <StyledToggleButton
                value="right"
                selected={isTextAlignActive("right")}
                onClick={() => setTextAlign("right")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.align-right-tooltip")}
              >
                <FormatAlignRight fontSize="small" />
              </StyledToggleButton>
            </Tooltip>

            <Tooltip title={t("common:richtext-editor.justify-tooltip")}>
              <StyledToggleButton
                value="justify"
                selected={isTextAlignActive("justify")}
                onClick={() => setTextAlign("justify")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.justify-tooltip")}
              >
                <FormatAlignJustify fontSize="small" />
              </StyledToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ margin: "0 8px" }} />

          <ToggleButtonGroup
            size="small"
            aria-label={t("common:richtext-editor.list-formatting-tooltip")}
            sx={{
              "& .MuiToggleButtonGroup-grouped": {
                border: "1px solid var(--color-light-gray) !important",
                margin: "0 !important",
                "&:not(:first-of-type)": {
                  borderLeft: "1px solid var(--color-light-gray) !important",
                },
                "&:hover": {
                  border: "1px solid var(--color-gray) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-gray) !important",
                  },
                },
                "&.Mui-selected": {
                  border: "1px solid var(--color-orange) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-orange) !important",
                  },
                },
                "&.Mui-selected:hover": {
                  border: "1px solid var(--color-orange) !important",
                  "&:not(:first-of-type)": {
                    borderLeft: "1px solid var(--color-orange) !important",
                  },
                },
              },
            }}
          >
            <Tooltip title={t("common:richtext-editor.bullet-list-tooltip")}>
              <StyledToggleButton
                value="bulletList"
                selected={isActive("bulletList")}
                onClick={() => toggleNode("bulletList")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.bullet-list-tooltip")}
              >
                <FormatListBulleted fontSize="small" />
              </StyledToggleButton>
            </Tooltip>

            <Tooltip title={t("common:richtext-editor.numbered-list-tooltip")}>
              <StyledToggleButton
                value="orderedList"
                selected={isActive("orderedList")}
                onClick={() => toggleNode("orderedList")}
                disabled={disabled}
                aria-label={t("common:richtext-editor.numbered-list-tooltip")}
              >
                <FormatListNumbered fontSize="small" />
              </StyledToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </ToolbarContainer>
        <ContentContainer>
          <EditorContent editor={editor} />
        </ContentContainer>
      </EditorContainer>

      {helperText && (
        <Box
          sx={{
            marginTop: "4px",
            fontSize: "0.75rem",
            color: error
              ? "var(--error-background-color)"
              : "var(--color-text-gray)",
          }}
        >
          {helperText}
        </Box>
      )}
    </Box>
  );
};

export default RichTextEditor;
