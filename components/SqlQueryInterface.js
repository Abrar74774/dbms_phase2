// components/SqlQueryInterface.js
import React, { useState } from 'react';
import {
  Container,
  TextArea,
  Button,
  ResultContainer,
  Table,
  TableHeader,
  TableRow,
  TableCell,
} from './SqlQueryInterface.styles';

export default function SqlQueryInterface() {
  const [query, setQuery] = useState(null);
  const [tokens, setTokens] = useState({
    selectExpressions: [],
    tableExpressions: {},
    whereExpressions: {operation: null, conditions: []}
  });
  const [executionPlans, setExecutionPlans] = useState([]);
  const [cost, setCost] = useState(null);

  function handleQueryChange(e) {
    setQuery(e.target.value);
  }

  function parseQuery(q){

function extractSelectAndTables(sqlQuery) {
    // Regular expressions to match SELECT and FROM clauses
    const selectRegex = /SELECT (.*?) FROM/i;
    const fromRegex = /FROM (.*?)(?:WHERE|$)/i;
    const whereRegex = /WHERE (.*)$/i
  
    // Extract SELECT and FROM expressions
    const selectMatch = sqlQuery.match(selectRegex);
    const fromMatch = sqlQuery.match(fromRegex);
    const whereMatch = sqlQuery.match(whereRegex);
  
    if (selectMatch && fromMatch) {
      const selectExpression = selectMatch[1].trim();
      const tableExpression = fromMatch[1].trim();
      if(whereMatch){
        const whereExpression = whereMatch[1].trim();

        return {
          selectExpression,
          tableExpression,
          whereExpression
        };
      }else {
        return {
          selectExpression,
          tableExpression
        };
      }

    } else {
      console.error('SQL query does not contain SELECT and FROM clauses.');
      return null;
    }
  }
  
  // Example usage:
  const sqlQuery1 = 'SELECT FirstName, LastName FROM Employees WHERE Department = Sales';
  //const sqlQuery2 = 'SELECT FirstName, LastName FROM Employees';
  const sqlQuery3 = 'SELECT FirstName, PNO FROM Employees JOIN Project WHERE Department = "Sales" AND SSN <= 6';
  const result = extractSelectAndTables(q);

  function extractSelectExpressions(selectExpression){
    const selectExpressions = []
    let index = 0;
    while(selectExpression.length != 0){
    if(selectExpression == '*'){
        selectExpressions.push(selectExpression)
        return selectExpressions
    }
    else if(selectExpression.match(/,|\s/i)){
        index = selectExpression.match(/,|\s/i).index
            selectExpressions.push(selectExpression.match(/(.*?)(?:,|\s)/i)[1])
            selectExpression = selectExpression.slice(index+1).trim()
    }else{
        selectExpressions.push(selectExpression)
        return selectExpressions
    }
    }
    console.error('ERROR: make sure the SELECT expressions syntax is correct');
      return null;
  }
  
  function extractTableExpressions(tableExpression){
    const tableExpressions = 
    {join: false,
    relations: []};
    let index = 0;
    while(tableExpression.length != 0){
      if(tableExpression.match(/NATURAL JOIN/i)){
        tableExpressions.join = true;
        index = tableExpression.match(/NATURAL JOIN/i).index
        tableExpressions.relations.push(tableExpression.match(/(.*?)(?:NATURAL JOIN)/i)[1])
        tableExpression = tableExpression.slice(index+12).trim()
    }
    else if(tableExpression.match(/JOIN/i)){
        tableExpressions.join = true;
        index = tableExpression.match(/JOIN/i).index
        tableExpressions.relations.push(tableExpression.match(/(.*?)(?:JOIN)/i)[1])
        tableExpression = tableExpression.slice(index+4).trim()
    }
    else if(tableExpression.match(/,|\s/i)){
        index = tableExpression.match(/,|\s/i).index
        tableExpressions.relations.push(tableExpression.match(/(.*?)(?:,|\s)/i)[1])
        tableExpression = tableExpression.slice(index+1).trim()
    }else{
      tableExpressions.relations.push(tableExpression)
        return tableExpressions
    }
    }
    console.error('ERROR: --------------------------------------------------');
      return null;
  }

  function extractSigmaConditions(expression){
    const sigmaConditions = {isEquality: false,
    isRange: false}
    //NEED TO DEBUG THE NON-SPACING CASE
    const expressionMatch = expression.match(/(.*?)(>=|<=|=|>|<)(.*?)$/i);

    sigmaConditions.attribute = expressionMatch[1].trim();
    if(expressionMatch[2] == '='){
      sigmaConditions.ope = expressionMatch[2]
      sigmaConditions.isEquality = true
    }
    else if(expressionMatch[2] == '>='|| expressionMatch[2] == '<='|| expressionMatch[2] == '>'|| expressionMatch[2] == '<'){
      sigmaConditions.ope = expressionMatch[2]
      sigmaConditions.isRange = true
    }
    sigmaConditions.value = expressionMatch[3].trim();

    return sigmaConditions
  }

  function extractWhereExpressions(whereExpression){
    const whereExpressions = {operation: null,
    conditions: []}
    let index = 0;
    while(whereExpression.length != 0){
      let match = whereExpression.match(/AND|OR/i)
    if(match == 'AND'){
      // if(whereExpression.match(/(.*?)(?:AND)/i)[1].includes('(')){
      //   index = whereExpression.match(/AND/i).index
      //   //whereExpressions.push('(')
      //   whereExpressions.push(extractSigmaConditions(whereExpression.match(/\((.*?)(?:AND)/i)[1].trim()))
      //   whereExpressions.push('AND');
      //   whereExpression = whereExpression.slice(index+3).trim()
      // }
      // else if(whereExpression.match(/(.*?)(?:AND)/i)[1].includes(')')){
      //   index = whereExpression.match(/AND/i).index
      //   whereExpressions.push(extractSigmaConditions(whereExpression.match(/(.*?)\)(?:AND)/i)[1].trim()))
      //   //whereExpressions.push('(')
      //   whereExpressions.push('AND');
      //   whereExpression = whereExpression.slice(index+3).trim()
      // }
      // else{
        index = whereExpression.match(/AND/i).index
        whereExpressions.conditions.push(extractSigmaConditions(whereExpression.match(/(.*?)(?:AND)/i)[1].trim()))
        whereExpressions.operation = 'AND';
        whereExpression = whereExpression.slice(index+3).trim()
      

    }else if(match == 'OR'){
      // if(whereExpression.match(/(.*?)(?:OR)/i)[1].includes('(')){
      //   index = whereExpression.match(/OR/i).index
      //   whereExpressions.push('(')
      //   whereExpressions.push(extractSigmaConditions(whereExpression.match(/\((.*?)(?:OR)/i)[1].trim()))
      //   whereExpressions.push('OR');
      //   whereExpression = whereExpression.slice(index+2).trim()
      // }
      // else if(whereExpression.match(/(.*?)(?:OR)/i)[1].includes(')')){
      //   index = whereExpression.match(/OR/i).index
      //   whereExpressions.push(extractSigmaConditions(whereExpression.match(/(.*?)\)(?:OR)/i)[1].trim()))
      //   whereExpressions.push(')')
      //   whereExpressions.push('OR');
      //   whereExpression = whereExpression.slice(index+2).trim()
      // }
      // else{
        index = whereExpression.match(/OR/i).index
        whereExpressions.conditions.push(extractSigmaConditions(whereExpression.match(/(.*?)(?:OR)/i)[1].trim()))
        whereExpressions.operation = 'OR';
        whereExpression = whereExpression.slice(index+2).trim()
      // }
  }else{
    // if(whereExpression.startsWith(')')){
    //   whereExpressions.push(')')
    //   whereExpressions.push(extractSigmaConditions(whereExpression.slice(1)))
    //   return whereExpressions
    // }
    // else if(whereExpression.endsWith(')')){
    //   let l = whereExpression.length
    //   whereExpressions.push(extractSigmaConditions(whereExpression.slice(0,l-1)))
    //   whereExpressions.push(')')
    //   return whereExpressions
    // }
    // else{
      whereExpressions.conditions.push(extractSigmaConditions(whereExpression))
      return whereExpressions
    //}
    }
    }
    console.error('ERROR: --------------------------------------------------');
      return null;
  }

  const t = {
    selectExpressions: extractSelectExpressions(result.selectExpression),
    tableExpressions: extractTableExpressions(result.tableExpression),
    whereExpressions: result.whereExpression?extractWhereExpressions(result.whereExpression):null
  }
  //console.log(t)
  return t
  }

  function handleExecuteQuery() {
    // ... (unchanged)
    console.log('Clicked!')
    setTokens(parseQuery(query))
    console.log(tokens)
  }

  return (
    <Container>
      <TextArea value={query} onChange={handleQueryChange} />
      <Button onClick={handleExecuteQuery}>Execute Query</Button>
      {tokens !== null && (
        <ResultContainer>
          <h2>Query Information:</h2>
          <p>SELECT Expressions: {tokens.selectExpressions}</p>
          <p>FROM Expressions: {tokens.tableExpressions.relations}</p>
          {tokens.whereExpressions !== null?<p>WHERE Expressions -postfix-: {tokens.whereExpressions.conditions.map((c) => {{c.attribute}{c.ope}{c.value}})}</p>:<p>NO WHERE Expression</p>}
        </ResultContainer>
      )}
      {cost !== null && (
        <ResultContainer>
          <h2>Estimated Cost:</h2>
          <p>{cost}</p>
        </ResultContainer>
      )}
      {executionPlans.length > 0 && (
        <ResultContainer>
          <h2>Execution Plans:</h2>
          <Table>
            <thead>
              <tr>
                <TableHeader>Plan</TableHeader>
                <TableHeader>Cost</TableHeader>
              </tr>
            </thead>
            <tbody>
              {executionPlans.map(function (plan, index) {
                return (
                  <TableRow key={index}>
                    <TableCell>{plan.plan}</TableCell>
                    <TableCell>{plan.cost}</TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </ResultContainer>
      )}
    </Container>
  );
}

//export default SqlQueryInterface;
