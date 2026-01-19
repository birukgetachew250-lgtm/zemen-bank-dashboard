
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/oracle-db';
import { encrypt, decrypt } from '@/lib/crypto';
import oracledb from 'oracledb';

const TABLE = '"APP_CONTROL_MODULE"."Integration"';

export async function GET() {
    try {
        const query = `SELECT "Id", "Name", "Service", "EndpointUrl", "Username", "Status", "IsProduction" FROM ${TABLE} ORDER BY "Service" ASC`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);

        if (!result.rows) {
            return NextResponse.json([]);
        }

        return NextResponse.json(result.rows.map((int: any) => ({
            id: int.Id,
            name: int.Name,
            service: int.Service,
            endpointUrl: int.EndpointUrl,
            username: int.Username,
            password: '••••••••', // Never send password to client
            status: int.Status,
            isProduction: int.IsProduction === 1,
        })));
    } catch (error) {
        console.error("Failed to fetch integrations:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, service, endpointUrl, username, password, isProduction } = await req.json();
        
        if (!name || !service || !endpointUrl) {
            return NextResponse.json({ message: 'Name, Service, and Endpoint URL are required' }, { status: 400 });
        }
        
        const query = `
            INSERT INTO ${TABLE} ("Name", "Service", "EndpointUrl", "Username", "Password", "IsProduction", "Status") 
            VALUES (:Name, :Service, :EndpointUrl, :Username, :Password, :IsProduction, 'Disconnected')
            RETURNING "Id" INTO :Id
        `;
        
        const binds: any = {
            Name: name,
            Service: service,
            EndpointUrl: endpointUrl,
            Username: username || null,
            Password: password ? encrypt(password) : null,
            IsProduction: isProduction ? 1 : 0,
            Id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        const newId = result.outBinds.Id[0];

        const newIntegrationQuery = `SELECT "Id", "Name", "Service", "EndpointUrl", "Username", "Status", "IsProduction" FROM ${TABLE} WHERE "Id" = :id`;
        const newIntegrationResult: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, newIntegrationQuery, { id: newId });
        const newIntegration = newIntegrationResult.rows[0];


        return NextResponse.json({
             id: newIntegration.Id,
            name: newIntegration.Name,
            service: newIntegration.Service,
            endpointUrl: newIntegration.EndpointUrl,
            username: newIntegration.Username,
            password: '••••••••',
            status: newIntegration.Status,
            isProduction: newIntegration.IsProduction === 1,
        }, { status: 201 });
    } catch (error: any) {
        console.error("Failed to create integration:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


export async function PUT(req: Request) {
    try {
        const { id, name, service, endpointUrl, username, password, isProduction, status } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'ID is required' }, { status: 400 });
        }
        
        const fieldsToUpdate = [];
        const binds: any = { Id: id };

        if (name !== undefined) { fieldsToUpdate.push('"Name" = :Name'); binds.Name = name; }
        if (service !== undefined) { fieldsToUpdate.push('"Service" = :Service'); binds.Service = service; }
        if (endpointUrl !== undefined) { fieldsToUpdate.push('"EndpointUrl" = :EndpointUrl'); binds.EndpointUrl = endpointUrl; }
        if (username !== undefined) { fieldsToUpdate.push('"Username" = :Username'); binds.Username = username; }
        if (password && !password.includes('••••••••')) { fieldsToUpdate.push('"Password" = :Password'); binds.Password = encrypt(password); }
        if (isProduction !== undefined) { fieldsToUpdate.push('"IsProduction" = :IsProduction'); binds.IsProduction = isProduction ? 1 : 0; }
        if (status !== undefined) { fieldsToUpdate.push('"Status" = :Status'); binds.Status = status; }
        
        if (fieldsToUpdate.length === 0) {
            return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
        }

        fieldsToUpdate.push('"UpdatedAt" = CURRENT_TIMESTAMP');

        const query = `UPDATE ${TABLE} SET ${fieldsToUpdate.join(', ')} WHERE "Id" = :Id`;

        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, binds);
        
        const updatedRecordQuery = `SELECT "Id", "Name", "Service", "EndpointUrl", "Username", "Status", "IsProduction" FROM ${TABLE} WHERE "Id" = :id`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, updatedRecordQuery, { id });
        const updatedRecord = result.rows[0];


        return NextResponse.json({
            id: updatedRecord.Id,
            name: updatedRecord.Name,
            service: updatedRecord.Service,
            endpointUrl: updatedRecord.EndpointUrl,
            username: updatedRecord.Username,
            password: '••••••••',
            status: updatedRecord.Status,
            isProduction: updatedRecord.IsProduction === 1,
        });

    } catch (error: any) {
        console.error('Failed to update integration:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ message: 'ID is required for deletion' }, { status: 400 });
        }

        const query = `DELETE FROM ${TABLE} WHERE "Id" = :id`;
        await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });

        return new Response(null, { status: 204 });

    } catch (error: any) {
        console.error("Failed to delete integration:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
