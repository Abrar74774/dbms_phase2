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
    let result;
    try {
        const query = 'SELECT * FROM meta_data_table;' // This is the query string
        result = await conn.query(
            query
        );
        console.log("here", convertYN(result.rows));
    } catch (error) {
        console.error("this is the error", error);
    }

    return Response.json({ rows: convertYN(result.rows)})
}