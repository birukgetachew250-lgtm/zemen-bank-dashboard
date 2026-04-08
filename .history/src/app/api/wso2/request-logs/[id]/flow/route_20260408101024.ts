import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';

const CS = process.env.WSO2_MODULE_DB_CONNECTION_STRING;
const TABLE = '"WSO2_MODULE"."WSO2_REQUEST_LOGS"';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Step 1: get the clicked record
    const initial: any = await executeQuery(CS, `SELECT * FROM ${TABLE} WHERE ID=:id`, { id });
    if (!initial.rows || initial.rows.length === 0) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const clickedRecord = initial.rows[0];
    let rootRequestId: string = clickedRecord.REQUEST_ID;

    // Step 2: walk up to find the true root (PARENT_REQUEST_ID IS NULL)
    let current = clickedRecord;
    const MAX_DEPTH = 20;
    let depth = 0;
    while (current.PARENT_REQUEST_ID && depth < MAX_DEPTH) {
      const parentResult: any = await executeQuery(
        CS,
        `SELECT * FROM ${TABLE} WHERE REQUEST_ID=:rid AND PARENT_REQUEST_ID IS NULL AND ROWNUM=1`,
        { rid: current.PARENT_REQUEST_ID }
      );
      if (parentResult.rows && parentResult.rows.length > 0) {
        current = parentResult.rows[0];
        rootRequestId = current.REQUEST_ID;
        break;
      }
      // try finding by REQUEST_ID = PARENT_REQUEST_ID
      const anyParent: any = await executeQuery(
        CS,
        `SELECT * FROM ${TABLE} WHERE REQUEST_ID=:rid AND ROWNUM=1`,
        { rid: current.PARENT_REQUEST_ID }
      );
      if (anyParent.rows && anyParent.rows.length > 0) {
        current = anyParent.rows[0];
        rootRequestId = current.REQUEST_ID;
      } else {
        break;
      }
      depth++;
    }

    // Step 3: use Oracle CONNECT BY to get full tree from root
    const treeResult: any = await executeQuery(
      CS,
      `SELECT l.*, LEVEL AS TREE_LEVEL, SYS_CONNECT_BY_PATH(l.SERVICE_NAME, ' > ') AS TREE_PATH
       FROM ${TABLE} l
       START WITH l.REQUEST_ID = :rootId AND l.PARENT_REQUEST_ID IS NULL
       CONNECT BY PRIOR l.REQUEST_ID = l.PARENT_REQUEST_ID
       ORDER SIBLINGS BY l.CREATED_DATE`,
      { rootId: rootRequestId }
    );

    // Fallback: if CONNECT BY returns nothing (e.g. root has parent), fetch all related by REQUEST_ID chain
    let rows = treeResult.rows || [];
    if (rows.length === 0) {
      const fallback: any = await executeQuery(
        CS,
        `SELECT l.*, DEPTH_LEVEL AS TREE_LEVEL FROM ${TABLE} l WHERE l.REQUEST_ID=:rid OR l.PARENT_REQUEST_ID=:rid ORDER BY l.CREATED_DATE`,
        { rid: rootRequestId }
      );
      rows = fallback.rows || [];
    }

    return NextResponse.json({ rootRequestId, nodes: rows });
  } catch (error) {
    console.error('Failed to fetch WSO2 request flow:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
