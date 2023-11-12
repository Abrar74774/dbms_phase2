// components/SqlQueryInterface.styles.js
import styled from 'styled-components';

export const Container = styled.div`
  max-width: 600px;
  margin: auto;
  padding: 20px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
`;

export const Button = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
`;

export const ResultContainer = styled.div`
  margin-top: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

export const TableHeader = styled.th`
  background-color: #f2f2f2;
  padding: 8px;
  text-align: left;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

export const TableCell = styled.td`
  padding: 8px;
`;
