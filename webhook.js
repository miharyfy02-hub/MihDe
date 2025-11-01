import fs from 'fs';
import path from 'path';
import axios from 'axios';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

export default async function handler(req,res){
    try{
        const body = req.body;
        if(body.object==='page'){
            for(const entry of body.entry){
                for(const change of entry.changes || []){
                    const value = change.value || {};
                    if(value.item==='comment' && value.verb==='add'){
                        const commentId = value.comment_id;
                        const message = value.message || '';
                        const postId = value.post_id || value.parent_id;

                        const filePath = path.resolve('./conditions.json');
                        let conditions = {};
                        if(fs.existsSync(filePath)){
                            conditions = JSON.parse(fs.readFileSync(filePath));
                        }
                        const cond = conditions[postId] || {default_reply:"Misaotra tamin'ny commentaire!", custom_conditions:[]};

                        let reply = cond.default_reply;
                        for(const c of cond.custom_conditions){
                            if(message.toLowerCase().includes(c.keyword.toLowerCase())){
                                reply = c.reply;
                                break;
                            }
                        }

                        // Mandefa reply amin'ny FB
                        const url = `https://graph.facebook.com/v17.0/${commentId}/comments`;
                        await axios.post(url,null,{
                            params:{message:reply, access_token:PAGE_ACCESS_TOKEN}
                        });
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.status(404).send('Not a page event');
        }
    } catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}
