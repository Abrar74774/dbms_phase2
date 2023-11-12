import conn from "@/lib/db";

const convertYN = (array) => {
    const out = array;
    out.forEach((row, index) => {
        Object.keys(row).forEach(prop => {
            if (array[index][prop] === 'Y') array[index][prop] = true
            if (array[index][prop] === 'N') array[index][prop] = false
        })
    });
    return out;
}

export async function GET(req) {
    let index;
    let table;
    try {
        const query = 'SELECT * FROM meta_data_table;' // This is the query string
        table = await conn.query(
            query
        );
        console.log("here", convertYN(table.rows));
    } catch (error) {
        console.error("this is the error", error);
    }

    try {
        const query = 'SELECT * FROM INDEX_METADATA;' // This is the query string
        index = await conn.query(
            query
        );
        console.log("here", convertYN(index.rows));
    } catch (error) {
        console.error("this is the error", error);
    }

    return Response.json({ index: convertYN(index.rows), table:convertYN(table.rows)})
}