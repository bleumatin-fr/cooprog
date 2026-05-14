import styled from "@emotion/styled";

const Container = styled.div`
  background-color: white;
  border: 1px solid var(--color-light-gray);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: center;

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 12px;
  }

  p {
    font-size: 1rem;
    color: #555;
    line-height: 1.6;
    margin: 0 auto;
    max-width: 600px;
  }
`;

const EmptyMessage = ({ title, text }: { title: string; text: string }) => {
  return (
    <Container>
      <h2>{title}</h2>
      <p>{text}</p>
    </Container>
  );
};

export default EmptyMessage;
