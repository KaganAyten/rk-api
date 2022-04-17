const express = require('express');
const bcrypt = require('bcryptjs');
const app=express();
const bp = require('body-parser')
const{getCharacters,getCharacterbyMail,deleteCharacter,addOrUpdateCharacter}=require('./dynamo');


app.use(express.json());
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

app.get('/users',async (req,res)=>{
    try{
        const users = await getCharacters();
        res.json(users);
    }
    catch(error){
        console.error(error);
        res.status(500).json({err:"Bişiler yanlış gitti"});
    }
});
app.post('/login',async (req,res)=>{
    const mail = req.body.mail;
    const postPassword = await req.body.pass;
    try{
        const user = await getCharacterbyMail(mail);
        console.log(user);
        if(user.Item){
            const validPassword = await bcrypt.compare(postPassword,user.Item.password)
            if(validPassword){
                res.json(user.Item.gameDatas);
            }
            else{
                console.log("şifre yanlş");
            }
        }
        else{
            console.log("there are no user");
        }
        
    }
    catch(error){
        console.error(error);
        res.status(500).json({err:"Bişiler yanlış gitti"});
    }
});
app.post('/register', async(req,res)=>{
    const user = req.body;
    console.log(user);
    try{
        const salt = await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(user.password,salt);
        const newUser = await addOrUpdateCharacter(user);
        res.json(newUser);
    }
    catch(error){
        console.error(error);
        res.status(500).json({err:"Bişiler yanlış gitti"});
    }
});
app.post('/resetpassword', async(req,res)=>{
    const mail = req.body.mail;
    const newPassword = await req.body.pass
    console.log(mail);
    console.log(newPassword);
    const user = await getCharacterbyMail(mail);
    console.log(user);
    const salt = await bcrypt.genSalt(10);
    user.Item.password=await bcrypt.hash(newPassword,salt);
    try{
        const updatedUser = await addOrUpdateCharacter(user.Item);
        res.json(updatedUser);
    }
    catch(error){
        console.error(error);
        res.status(500).json({err:"Bişiler yanlış gitti"});
    }
});
app.post('/changepp', async(req,res)=>{
    const mail = req.body.mail;
    const ppUrl = req.body.pp;
    const user = await getCharacterbyMail(mail);
    user.Item.gameDatas.icon=ppUrl;
    try{
        const updatedUser = await addOrUpdateCharacter(user.Item);
        res.json(updatedUser);
    }
    catch(error){
        console.error(error);
        res.status(500).json({err:"Bişiler yanlış gitti"});
    }
});

app.delete('/users/:id', async(req,res)=>{
    const {id}=req.params;
    try{
        res.json(await deleteCharacter(id));
    }
    catch(error){
        console.error(error);
        res.status(500).json({err:"Bişiler yanlış gitti"});
    }
});


const port=process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log("listening port");
});