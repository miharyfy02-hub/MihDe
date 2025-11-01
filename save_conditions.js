import fs from 'fs';
import path from 'path';

export default function handler(req, res){
    if(req.method==='POST'){
        const body = req.body;
        const filePath = path.resolve('./conditions.json');
        let conditions = {};
        if(fs.existsSync(filePath)){
            conditions = JSON.parse(fs.readFileSync(filePath));
        }
        conditions[body.page_id] = body;
        fs.writeFileSync(filePath, JSON.stringify(conditions,null,2));
        res.status(200).json({success:true});
    } else {
        res.status(405).json({error:"Method Not Allowed"});
    }
}
