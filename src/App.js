// import logo from './logo.svg';
import {Box,Container,VStack,Button,Input, HStack, background} from "@chakra-ui/react"
import Message from "./components/Message";
import { onAuthStateChanged,getAuth,GoogleAuthProvider,signInWithPopup,signOut} from "firebase/auth"
import {app} from "./firebase"
import { useEffect, useState,useRef } from "react";
import { getFirestore,addDoc, collection , serverTimestamp, onSnapshot , query , orderBy} from "firebase/firestore"
const auth=getAuth(app)

const db= getFirestore(app)


const loginhandler = ()=>{
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth,provider)
}
const logouthandler =()=>signOut(auth);
function App() {
  
  const [user,setuser]=useState(false);
  const [message,setmessage]=useState("");
  const [messages,Setmessages]=useState([]);

  const divforScroll= useRef()
  // console.log(user) 
  const submitHandler =async(e)=>{
    e.preventDefault();
    
    try{
  
      setmessage("");

      await addDoc(collection(db,"Messages"),{
        text:message,
        uid:user.uid,
        uri:user.photoURL,
        createdAt: serverTimestamp(),
      });
      
      divforScroll.current.scrollIntoView({behaviour: "smooth"});
    }catch(error){
      alert(error)
    }

  }

  useEffect(()=>{

    const q= query(collection(db,"Messages"),orderBy("createdAt","asc"));

    const unsubscribe=onAuthStateChanged(auth,(data)=>{
      setuser(data)
    });

    const unsubscribeformessage= onSnapshot(q,(snap)=>{
      Setmessages(snap.docs.map((item)=>{
        const id= item.id;
        return {id, ...item.data()};
      }))
    })

    return ()=>{
      unsubscribe();
      unsubscribeformessage();
    };
  },[]);
  return (
    <Box bg={"red.50"}>
      {
        user?(
          <Container h={"100vh"} bg={"white"}>
        <VStack h={"full"} paddingY={"4"}>
            <Button w={"full"} colorScheme="red" onClick={logouthandler}>
              Logout</Button>
       <VStack h={"full"} w={"full"} overflowY={"auto"} css={{"&::-webkit-scrollbar":{
        display: "none",
       },
       }}>
      
        {/* <Message text={"sample text"} /> */}
        {
          messages.map((item)=>(
            <Message
            key={item.id}
            user={item.uid==user.uid?"me":"other"}
            text={item.text}
            uri={item.uri} 
            />
          ))
        }
        <div ref={divforScroll}></div>
       </VStack>
        

       <form onSubmit={submitHandler} style={{width: "100%"}}>
        <HStack>
        <Input value={message} onChange={(e)=>{
          setmessage(e.target.value)
        }} placeholder="Enter a message" />
        <Button type="submit" colorScheme="purple">Send</Button>
        </HStack>
       </form>
       </VStack>
      </Container>
        ):(
          <VStack bg={"white"} justifyContent={"center"}  h={"100vh"}>
           <Button onClick={loginhandler} colorScheme="purple">Signin With Google</Button> 
          </VStack>
        )
      }
    </Box>
  );
}

export default App;
