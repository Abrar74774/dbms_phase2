// components/SqlQueryInterface.js
import React, { useEffect, useState } from 'react';
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
  const [sql, setSql] = useState("");
  const [tokens, setTokens] = useState({
    selectExpressions: [],
    tableExpressions: {},
    whereExpressions: {operation: null, conditions: []}
  });
  //const [executionPlans, setExecutionPlans] = useState([]);
  const [es, setEs] = useState(null);
  const [click, setClick] = useState()
  const [loading, setLoading] = useState()

  function handleQueryChange(e) {
    setSql(e.target.value);
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
  
  const result = extractSelectAndTables(q);
  if(result == null)
  return null

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

  async function estimateCost(q){
    const res = await fetch('/api')
    const data = await res.json();
    console.log(data.rows)
    const meta_data_table = data.table;
    console.log(meta_data_table)
    const index_Meta = data.index;
    console.log(index_Meta);

    //estimation logic:
    function CalculateExecutionPlan(query){
      if(!query.tableExpressions.join){
          let table = query.tableExpressions.relations[0];
          if(query.whereExpressions.operation == null){
              for (const condition of query.whereExpressions.conditions){
                      if(condition.isEquality){
                          console.log(estimateEqualitySelection(table, condition.attribute))
                          return (estimateEqualitySelection(table, condition.attribute))
                      }
                      else if(condition.isRange){
                          console.log(estimateRangeSelection(table, condition.attribute))
                          return (estimateRangeSelection(table, condition.attribute))
                      }
                  }
              }else if(query.whereExpressions.operation.toLowerCase() == "or"){
                  console.log(handleOrCondition(table));
                  return (handleOrCondition(table))
              }else if(query.whereExpressions.operation.toLowerCase() == "and"){
                  let condition1 = query.whereExpressions.conditions[0];
                  let condition2 = query.whereExpressions.conditions[1];
                  console.log(handleAndCondition(table, condition1, condition2));
                  return (handleAndCondition(table, condition1, condition2))
              }
      }else{
          console.log(estimateJoin("manager", "project", "ssn", "ssn"));
          return estimateJoin("manager", "project", "ssn", "ssn")
      }
  }
  console.log("HEY, QUERY HANDLING DONE!")
  
  
  
  
  
  function handleOrCondition(table){
      let first = meta_data_table.filter((element) => 
      element.table_name.toLowerCase() == table.toLowerCase());
      let thisOBJ = first[0];
      let cost = thisOBJ.b;
  
      let finalOBject = {
          plan: "Use sequential search",
          cost: cost
      }
  
      return finalOBject
  
  }
  
  
  function handleAndCondition(table, condition1, condition2){
  
      let Cost1;
      let Cost2;
      if(condition1.isEquality){
          let C1 = estimateEqualitySelection(table, condition1.attribute)
          const suggestion = C1.suggestion;
          const lowestCostMatch = suggestion.match(/\d+/); 
  
          // Checking if lowestCostMatch is not null before accessing its value
          Cost1 = lowestCostMatch ? parseInt(lowestCostMatch[0]) : null;
          console.log(Cost1);
      }else if(condition1.isRange){
          let C1 = estimateRangeSelection(table, condition1.attribute)
          const suggestion = C1.suggestion;
          const lowestCostMatch = suggestion.match(/\d+/); 
  
          // Checking if lowestCostMatch is not null before accessing its value
          Cost1 = lowestCostMatch ? parseInt(lowestCostMatch[0]) : null;
          console.log(Cost1);
      }
  
  
      if(condition2.isEquality){
          let C2 = estimateEqualitySelection(table, condition2.attribute)
          const suggestion = C2.suggestion;
          const lowestCostMatch = suggestion.match(/\d+/); 
  
          // Checking if lowestCostMatch is not null before accessing its value
          Cost2 = lowestCostMatch ? parseInt(lowestCostMatch[0]) : null;
          console.log(Cost2);
      }else if(condition2.isRange){
          let C2 = estimateRangeSelection(table, condition2.attribute)
          const suggestion = C2.suggestion;
          const lowestCostMatch = suggestion.match(/\d+/); 
  
          // Checking if lowestCostMatch is not null before accessing its value
          Cost2 = lowestCostMatch ? parseInt(lowestCostMatch[0]) : null;
          console.log(Cost2);
      }
  
  
      let finalCost = Math.min(Cost1, Cost2);
  
      let finalOBject = {
          plan: "Use the condition with the lower cost first",
          cost: finalCost
      }
  
      return finalOBject
  
  
  }
  function estimateEqualitySelection(table, attribute){
      let executionPlansArray = [];
      let CostArray = [];
      let planCount = 0;
      let cost;
      let first = meta_data_table.filter((element) => 
      element.table_name.toLowerCase() == table.toLowerCase() && element.attribute.toLowerCase() == attribute.toLowerCase());
      let attributeOBJ = first[0];
      if(attributeOBJ.is_pk){
          planCount++
          console.log("Use primary index");
          console.log(`cost ${planCount} :`);
          let thisIndexArray = index_Meta.filter(index => 
              index.table_name.toLowerCase() == table.toLowerCase() && index.index_attribute.toLowerCase() == attribute.toLowerCase()
          );
          let thisIndex = thisIndexArray[0]
          cost = thisIndex.index_levels + 1 //x+1
          console.log(Math.ceil(cost));
          CostArray.push(Math.ceil(cost));
          executionPlansArray.push(`Cost for using primary index: ${Math.ceil(cost)}`);
      }
      if(attributeOBJ.has_secondary_index){
          planCount++
          console.log("Use Secondary index");
          console.log(`cost ${planCount} :`);
          let thisIndexArray = index_Meta.filter(index => 
              index.table_name.toLowerCase() == table.toLowerCase() && index.index_attribute.toLowerCase() == attribute.toLowerCase()
          );
          let thisIndex = thisIndexArray[0];
          let sel_car = attributeOBJ.attribute_selectivity * attributeOBJ.num_of_rows;
          cost = thisIndex.index_levels  + (sel_car) //x+s (worst case)
          console.log(Math.ceil(cost));
          CostArray.push(Math.ceil(cost));
          executionPlansArray.push(`Cost for using secondary index: ${Math.ceil(cost)}`);
      }
      //for sequential/linear search:
      planCount++
      console.log("Use sequential Search");
      console.log(`cost ${planCount} :`);
      cost = (attributeOBJ.b)/2 //b/2 on average
      console.log(Math.ceil(cost));
      CostArray.push(Math.ceil(cost));
      executionPlansArray.push(`Cost for using sequential search: ${Math.ceil(cost)}`);
  
      //for Binary Search:
      planCount++
      console.log("Use Binary Search");
      console.log(`cost ${planCount} :`);
      let sel_car = attributeOBJ.attribute_selectivity * attributeOBJ.num_of_rows; //s = sl*r
      cost = (Math.log2(attributeOBJ.b) )+ (Math.ceil(sel_car/attributeOBJ.bfr)) - 1  ; //[log2(b) + (s/bfr) - 1] where s is selection cardinality = sl * r
      console.log(Math.ceil(cost));
      CostArray.push(Math.ceil(cost));
      executionPlansArray.push(`Cost for using binary search: ${Math.ceil(cost)}`);
  
  
      let lowestCost = findLowestCost(CostArray);
      console.log("lowestCost available: "+lowestCost);
  
  
      let finalOBject = {
          plan: executionPlansArray,
          suggestion: `use the plan with the cost: `+ lowestCost
      }
  
      return finalOBject
  };
  
  function estimateRangeSelection(table, attribute){
      let executionPlansArray = []
      let CostArray = [];
      let planCount = 0;
      let cost;
      let first = meta_data_table.filter((element) => 
      element.table_name.toLowerCase() == table.toLowerCase() && element.attribute.toLowerCase() == attribute.toLowerCase());
      let attributeOBJ = first[0];
      console.log(attributeOBJ);
      if(attributeOBJ.is_ordering){
          planCount++
          console.log("Use Ordering index");
          console.log(`cost ${planCount} :`);
          let thisIndexArray = index_Meta.filter(index => 
              index.table_name.toLowerCase() == table.toLowerCase() && index.index_attribute.toLowerCase() == attribute.toLowerCase()
          );
          let thisIndex = thisIndexArray[0]
          cost = thisIndex.index_levels + (attributeOBJ.b/2) //x+b/2
          console.log(Math.ceil(cost));
          CostArray.push(Math.ceil(cost));
          executionPlansArray.push(`Cost for using ordering index: ${Math.ceil(cost)}`);
      }
      if(attributeOBJ.has_secondary_index){
          planCount++
          console.log("Use Secondary index");
          console.log(`cost ${planCount} :`);
          let thisIndexArray = index_Meta.filter(index => 
              index.table_name.toLowerCase() == table.toLowerCase() && index.index_attribute.toLowerCase() == attribute.toLowerCase()
          );
          let thisIndex = thisIndexArray[0];
          // console.log(thisIndex)
          cost = thisIndex.index_levels + (thisIndex.bi/2) + (attributeOBJ.num_of_rows/2) //x+(bI/2)+(r/2)
          console.log(Math.ceil(cost));
          CostArray.push(Math.ceil(cost));
          executionPlansArray.push(`Cost for using secondary index: ${Math.ceil(cost)}`);
  
      }
      //for sequential/linear search:
      planCount++
      console.log("Use sequential Search");
      console.log(`cost ${planCount} :`);
      cost = attributeOBJ.b //b (worst case)
      console.log(Math.ceil(cost));
      CostArray.push(Math.ceil(cost));
      executionPlansArray.push(`Cost for using sequential search: ${Math.ceil(cost)}`);
  
      let lowestCost = findLowestCost(CostArray);
      console.log("lowestCost available: "+lowestCost);
  
      let finalOBject = {
          plan: executionPlansArray,
          suggestion: `use the plan with the cost: ` + lowestCost
      }
  
      return finalOBject
  
  
  }
  
  
  
  
  function findLowestCost(numbers) {
      if (numbers.length === 0) {
        
        return undefined;
      }
    
      // Use the apply method to pass the array elements as arguments to Math.min
      return Math.min.apply(null, numbers);
    }
  
  function estimateJoin(table1, table2, attribute1, attribute2){
      //only one situation: Manager.SSN(PK) = Project.SSN(FK)
      //Join selectivity should be ratio of the size of the resulting join file to the size of the cartesian product file
      //should be 1000 (number of tuples for the equijoined table) over 100*1000 = 100,000, so js = 1000/100,000 = 0.01
      let executionPlansArray = []
  
      let CostArray =[];
      let first = meta_data_table.filter((element) => 
      element.table_name == table1.toLowerCase() && element.attribute == attribute1.toLowerCase());
      let first_NDV = first[0].attribute_ndv;
      // console.log("HERE")
      // console.log(first);
      // console.log(first_NDV);
  
      let second = meta_data_table.filter((element) => 
      element.table_name == table2.toLowerCase() && element.attribute == attribute2.toLowerCase());
      let second_NDV = second[0].attribute_ndv;
      let joinSelectivity = 1/(Math.max(first_NDV, second_NDV));
      let joinCardinality = joinSelectivity * first[0].num_of_rows * second[0].num_of_rows; //js * |MANGER| * |PROJECT|
  
  
      console.log("JOIN SELECTIVITY: "+joinSelectivity);
      console.log("JOIN CARDINALITY " + joinCardinality);
      console.log(`For Nested loop join with ${first[0].table_name} relation as outer loop: `+'\n'); //ASSUMING 3 main memory buffer pages
      let CJ1a = first[0].b + (first[0].b * second[0].b);
      console.log(CJ1a);
      CostArray.push(CJ1a)
      executionPlansArray.push(`Cost for using Nested loop join with ${first[0].table_name} relation as outer loop: ${CJ1a}`)
      console.log(`For Nested loop join with ${second[0].table_name} relation as outer loop: `+'\n');
      let CJ1b = second[0].b + (first[0].b * second[0].b);
      console.log(CJ1b);
      CostArray.push(CJ1b)
      executionPlansArray.push(`Cost for using Nested loop join with ${second[0].table_name} relation as outer loop: ${CJ1b}`)
      console.log(`For indexed baessd nested loop join with ${first[0].table_name} relation as outer loop:`)
      let first_index = index_Meta.filter((element) => 
      element.table_name.toLowerCase() == table1.toLowerCase() && element.index_attribute.toLowerCase() == attribute1.toLowerCase());
      let first_index_level = first_index[0].index_levels;
      let CJ2a = first[0].b + (first[0].num_of_rows * (first_index_level + (first[0].attribute_selectivity * first[0].num_of_rows)));
      console.log(CJ2a);
      CostArray.push(CJ2a)
      executionPlansArray.push(`Cost for using indexed baessd nested loop join with ${first[0].table_name} relation as outer loop: ${CJ2a}`)
  
      console.log(`For indexed based nested loop join ${second[0].table_name} relation as outer loop:`)
      let second_index = index_Meta.filter((element) => 
      element.table_name.toLowerCase() == table2.toLowerCase() && element.index_attribute.toLowerCase() == attribute2.toLowerCase());
      let second_index_level = second_index[0].index_levels;
      let CJ2b = second[0].b + (second[0].num_of_rows * (second_index_level + (second[0].attribute_selectivity * second[0].num_of_rows)));
      console.log(CJ2b);
      CostArray.push(CJ2b)
      executionPlansArray.push(`Cost for using indexed baessd nested loop join with ${second[0].table_name} relation as outer loop: ${CJ2b}`)
      console.log(CostArray)
      let lowestCost = findLowestCost(CostArray);
      console.log(lowestCost);
  
      let finalOBject = {
          plan: executionPlansArray,
          suggestion: `use the plan with the cost: ` + lowestCost
      }
  
      return finalOBject
  
  };
  
  return CalculateExecutionPlan(q)
  }

  function handleExecuteQuery() {
    console.log('Clicked!')
    setClick(Math.floor(Math.random() * (100000 - 1) + 1))
  }

  useEffect(() => {
    // Call yourFunction after the initial render
    async function handleQuery() {
      try{      
        setLoading(true)
        const estimates = await estimateCost(parseQuery(sql))
        setEs(estimates)
      }finally{
        setLoading(false)
      }
    }

    handleQuery();
  }, [click]);

  return (
    <Container>
      <TextArea value={sql} onChange={handleQueryChange} />
      <Button onClick={handleExecuteQuery}>Estimate Query</Button>
      {tokens !== null && (
        <ResultContainer>
          <h2>Query Information:</h2>
          <p>SELECT Expressions: {tokens.selectExpressions}</p>
          <p>FROM Expressions: {tokens.tableExpressions.relations + (tokens.tableExpressions.join?' (JOIN)':'')}</p>
          <p>WHERE Expressions:</p>
          {tokens.whereExpressions !== null?tokens.whereExpressions.conditions.map(c => <p>{"attribute: " + c.attribute + " ,operation: " + c.ope + " ,value: " + c.value}</p>):<p>None</p>}
        </ResultContainer>
      )}
      {/* {e !== null && (} */}
        {es !== null && ( loading?  <ResultContainer><h2>Loading..</h2> </ResultContainer> :
        <ResultContainer>
          <h2>Estimated Cost:</h2>
          {es.plan.map(p => <p>{p}</p>)}
          <p>suggestion: {es.suggestion}</p>
        </ResultContainer>
        )}
      {/* )} */}
      {/* {executionPlans.length > 0 && (
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
      )} */}
    </Container>
  );
}

//export default SqlQueryInterface;
