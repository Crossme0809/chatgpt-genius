import Image from "next/image";
import profilePic from "/public/user.png";
import openAIPic from "/public/openai.png";


export default function Chat({user}) {

    return (  
            <div id="chat" className={`flex justify-center m-3 pr-28 py-7 rounded-md ${user.user === "me" ? "bg-gray-700" : "bg-gray-600"} `}>
                <div className="w-1/5">
                    <Image
                        src= {user.user === "me" ? profilePic : openAIPic}
                        className="ml-auto mr-auto rounded-sm"
                        alt="picture of you"
                        width={30}
                        height={30}
                    />
                </div>
                <div className="w-4/5 text-gray-100 text-sm" style={{whiteSpace: 'pre-wrap'}}>
                   {user.image ? <img src={user.image}/> : user.message}  
                </div>
            </div>   
    )
}
            