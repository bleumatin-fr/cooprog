import React from "react";
import styled from "@emotion/styled";
import { Link as LinkType, FileType } from "@cooprog/core";
import useProject from "./useProject";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: underline;

  &:hover {
    font-weight: bold;
  }
`;

const StyledFile = styled.a`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  color: var(--color-gray-dark);
  text-decoration: none;
`;

const FileName = styled.span`
  text-decoration: underline;
  &:hover {
    font-weight: bold;
  }
`;

const FileInfo = styled.span`
  font-size: 11px;
  color: var(--color-gray-dark);
  text-decoration: none;
`;

interface FilesAndLinksProps {
  projectId: string;

  links?: LinkType[];
  files?: FileType[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const addProtocol = (url: string): string => {
  if (!url.startsWith("http")) {
    return `https://${url}`;
  }
  return url;
};

const FilesAndLinks: React.FC<FilesAndLinksProps> = ({
  projectId,
  links = [],
  files = [],
}) => {
  const { downloadProjectFile } = useProject(projectId);
  return (
    <Wrapper>
      {links.map((link) => (
        <StyledLink
          key={link._id}
          href={addProtocol(link.url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.name}
        </StyledLink>
      ))}
      {files.map((file) => (
        <StyledFile
          key={file._id}
          onClick={() => downloadProjectFile(file._id, file.name)}
          title="Download file"
        >
          <FileName>{file.name}</FileName>{" "}
          <FileInfo>
            ({file.extension.toLowerCase()}, {formatBytes(file.size)})
          </FileInfo>
        </StyledFile>
      ))}
    </Wrapper>
  );
};

export default FilesAndLinks;
