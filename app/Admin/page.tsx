"use client";
import React, { useState, useEffect } from "react";
import AmoliChart from "@/components/AmoliCharts";
import TalimDonutChart from "@/components/TalimBisoyChart";
import { useSelectedUser } from "@/providers/treeProvider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/TabButton";
import { userMoktobBisoyData } from "../data/moktobBisoyUserData";
import { userDawatiBisoyData } from "../data/dawatiBisoyUserData";
import { userDawatiMojlishData } from "../data/dawatiMojlishUserData";
import { userJamatBisoyData } from "../data/jamatBisoyData";
import { userDineFeraData } from "../data/dineferaUserData";
import { userSoforBisoyData } from "../data/userSoforBisoyData";
import { userDayeData } from "../data/dayiUserData";
import TallyAdmin from "@/components/TallyAdmin";
import { useSession } from "next-auth/react";
import Tally from "@/components/Tally";
import { userTalimBisoyData } from "../data/talimBisoyUserData";
import { userAmoliBisoyData } from "../data/amoliMuhasabaUserData";
import AmoliChartAdmin from "@/components/AmoliChartAdmin";

const AdminPage: React.FC = () => {
  const { selectedUser } = useSelectedUser();
  // const [emailList, setEmailList] = useState(selectedUser);
  let emailList: string[] = [selectedUser];
  console.log("Email", emailList);

  // const userEmail = localStorage.getItem("userEmail");
  // const userEmail =
  //   typeof window !== "undefined"
  //     ? localStorage.getItem("userEmail")
  //     : "moni@gmail.com";

  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  let dashboardData;

  if (selectedUser === "rifat@gmail.com") {
    emailList = [
      "rifat@gmail.com",
      "faysal@gmail.com",
      "jewel@gmail.com",
      "riyad@gmail.com",
      "nazmul@gmail.com",
    ];
  } else if (selectedUser === "akash@gmail.com") {
    emailList = [
      "akash@gmail.com",
      "ripon@gmail.com",
      "sumon@gmail.com",
      "taskin@gmail.com",
      "shoriful@gmail.com",
    ];
  } else if (selectedUser === "toyon@gmail.com") {
    emailList = [
      "toyon@gmail.com",
      "faysal@gmail.com",
      "jewel@gmail.com",
      "riyad@gmail.com",
      "nazmul@gmail.com",
      "ripon@gmail.com",
      "sumon@gmail.com",
      "taskin@gmail.com",
      "shoriful@gmail.com",
    ];
  } else if (selectedUser === "zisan@gmail.com") {
    emailList = ["zisan@gmail.com", "faysal@gmail.com", "jewel@gmail.com"];
  } else if (selectedUser === "tauhid@gmail.com") {
    emailList = ["tauhid@gmail.com", "riyad@gmail.com", "nazmul@gmail.com"];
  } else if (selectedUser === "sadman@gmail.com") {
    emailList = ["sadman@gmail.com", "ripon@gmail.com", "sumon@gmail.com"];
  } else if (selectedUser === "saurav@gmail.com") {
    emailList = ["saurav@gmail.com", "taskin@gmail.com", "shoriful@gmail.com"];
  } else if (selectedUser === "taijul@gmail.com") {
    emailList = ["taijul@gmail.com", "mehedi@gmail.com", "masum@gmail.com"];
  } else if (selectedUser === "ripon@gmail.com") {
    emailList = ["ripon@gmail.com", "amirul@gmail.com", "jahidul@gmail.com"];
  } else if (selectedUser === "tamim@gmail.com") {
    emailList = [
      "tamim@gmail.com",
      "mehedi@gmail.com",
      "masum@gmail.com",
      "amirul@gmail.com",
      "jahidul@gmail.com",
    ];
  } else if (selectedUser === "aftab@gmail.com") {
    emailList = ["aftab@gmail.com", "javed@gmail.com", "ashraful@gmail.com"];
  } else if (selectedUser === "salek@gmail.com") {
    emailList = ["salek@gmail.com", "mehmed@gmail.com", "osman@gmail.com"];
  } else if (selectedUser === "hridoy@gmail.com") {
    emailList = [
      "hridoy@gmail.com",
      "mehedi@gmail.com",
      "masum@gmail.com",
      "amirul@gmail.com",
      "jahidul@gmail.com",
      "javed@gmail.com",
      "ashraful@gmail.com",
      "mehmed@gmail.com",
      "osman@gmail.com",
    ];
  } else if (selectedUser === "tanzid@gmail.com") {
    emailList = [
      "tanzid@gmail.com",
      "javed@gmail.com",
      "ashraful@gmail.com",
      "mehmed@gmail.com",
      "osman@gmail.com",
    ];
  } else if (selectedUser === "estiak@gmail.com") {
    emailList = [
      "estiak@gmail.com",
      "faysal@gmail.com",
      "jewel@gmail.com",
      "riyad@gmail.com",
      "nazmul@gmail.com",
      "ripon@gmail.com",
      "sumon@gmail.com",
      "taskin@gmail.com",
      "shoriful@gmail.com",
      "mehedi@gmail.com",
      "masum@gmail.com",
      "amirul@gmail.com",
      "jahidul@gmail.com",
      "javed@gmail.com",
      "ashraful@gmail.com",
      "mehmed@gmail.com",
      "osman@gmail.com",
    ];
  } else if (selectedUser === "shezaan@gmail.com") {
    emailList = ["shezaan@gmail.com", "imad@gmail.com", "naim@gmail.com"];
  } else if (selectedUser === "mughdo@gmail.com") {
    emailList = ["mughdo@gmail.com", "sayeed@gmail.com", "sajeeb@gmail.com"];
  } else if (selectedUser === "liton@gmail.com") {
    emailList = [
      "liton@gmail.com",
      "imad@gmail.com",
      "naim@gmail.com",
      "sayeed@gmail.com",
      "sajeeb@gmail.com",
    ];
  } else if (selectedUser === "mahfuz@gmail.com") {
    emailList = ["mahfuz@gmail.com", "sarjees@gmail.com", "rafi@gmail.com"];
  } else if (selectedUser === "asif@gmail.com") {
    emailList = ["asif@gmail.com", "nahid@gmail.com", "hasnat@gmail.com"];
  } else if (selectedUser === "shakil@gmail.com") {
    emailList = [
      "shakil@gmail.com",
      "imad@gmail.com",
      "naim@gmail.com",
      "sayeed@gmail.com",
      "sajeeb@gmail.com",
      "sarjees@gmail.com",
      "rafi@gmail.com",
      "nahid@gmail.com",
      "hasnat@gmail.com",
    ];
  } else if (selectedUser === "saif@gmail.com") {
    emailList = [
      "saif@gmail.com",
      "sarjees@gmail.com",
      "rafi@gmail.com",
      "nahid@gmail.com",
      "hasnat@gmail.com",
    ];
  } else if (selectedUser === "babor@gmail.com") {
    emailList = ["babor@gmail.com", "rizwan@gmail.com", "shaheen@gmail.com"];
  } else if (selectedUser === "nasim@gmail.com") {
    emailList = ["nasim@gmail.com", "ameer@gmail.com", "hasnain@gmail.com"];
  } else if (selectedUser === "raju@gmail.com") {
    emailList = [
      "raju@gmail.com",
      "rizwan@gmail.com",
      "shaheen@gmail.com",
      "ameer@gmail.com",
      "hasnain@gmail.com",
    ];
  } else if (selectedUser === "imran@gmail.com") {
    emailList = ["imran@gmail.com", "rashid@gmail.com", "gurbaz@gmail.com"];
  } else if (selectedUser === "faruque@gmail.com") {
    emailList = [
      "faruque@gmail.com",
      "omarzai@gmail.com",
      "nazibullah@gmail.com",
    ];
  } else if (selectedUser === "mezbah@gmail.com") {
    emailList = [
      "mezbah@gmail.com",
      "rashid@gmail.com",
      "gurbaz@gmail.com",
      "omarzai@gmail.com",
      "nazibullah@gmail.com",
    ];
  } else if (selectedUser === "pollob@gmail.com") {
    emailList = [
      "pollob@gmail.com",
      "rashid@gmail.com",
      "gurbaz@gmail.com",
      "omarzai@gmail.com",
      "nazibullah@gmail.com",
      "rizwan@gmail.com",
      "shaheen@gmail.com",
      "ameer@gmail.com",
      "hasnain@gmail.com",
    ];
  } else if (selectedUser === "ratul@gmail.com") {
    emailList = [
      "ratul@gmail.com",
      "imad@gmail.com",
      "naim@gmail.com",
      "sayeed@gmail.com",
      "sajeeb@gmail.com",
      "sarjees@gmail.com",
      "rafi@gmail.com",
      "nahid@gmail.com",
      "hasnat@gmail.com",
      "rashid@gmail.com",
      "gurbaz@gmail.com",
      "omarzai@gmail.com",
      "nazibullah@gmail.com",
      "rizwan@gmail.com",
      "shaheen@gmail.com",
      "ameer@gmail.com",
      "hasnain@gmail.com",
    ];
  } else if (selectedUser === "moni@gmail.com") {
    emailList = [
      "moni@gmail.com",
      "faysal@gmail.com",
      "jewel@gmail.com",
      "riyad@gmail.com",
      "nazmul@gmail.com",
      "ripon@gmail.com",
      "sumon@gmail.com",
      "taskin@gmail.com",
      "shoriful@gmail.com",
      "mehedi@gmail.com",
      "masum@gmail.com",
      "amirul@gmail.com",
      "jahidul@gmail.com",
      "javed@gmail.com",
      "ashraful@gmail.com",
      "mehmed@gmail.com",
      "osman@gmail.com",
      "imad@gmail.com",
      "naim@gmail.com",
      "sayeed@gmail.com",
      "sajeeb@gmail.com",
      "sarjees@gmail.com",
      "rafi@gmail.com",
      "nahid@gmail.com",
      "hasnat@gmail.com",
      "rashid@gmail.com",
      "gurbaz@gmail.com",
      "omarzai@gmail.com",
      "nazibullah@gmail.com",
      "rizwan@gmail.com",
      "shaheen@gmail.com",
      "ameer@gmail.com",
      "hasnain@gmail.com",
    ];
  } else if (!selectedUser) {
    emailList = [userEmail];
  } else {
    emailList = [selectedUser];
  }

  console.log("Email List:", emailList);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome,{"  "}
          <span className="text-2xl text-emerald-600">
            {session?.user?.name}
          </span>
        </h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grow grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8 pb-4 pt-2">
          <AmoliChartAdmin
            data={userAmoliBisoyData.records}
            emailList={emailList}
          />

          <TallyAdmin
            userData={userMoktobBisoyData}
            emails={emailList}
            title="Moktob Bisoy Tally"
          />
          <TallyAdmin
            userData={userDawatiBisoyData}
            emails={emailList}
            title="Dawati Bisoy Tally"
          />

          <TallyAdmin
            userData={userDawatiMojlishData}
            emails={emailList}
            title="Dawati Mojlish Tally"
          />

          <TallyAdmin
            userData={userJamatBisoyData}
            emails={emailList}
            title="Jamat Bisoy Tally"
          />

          <TallyAdmin
            userData={userDineFeraData}
            emails={emailList}
            title="Dine Fireche Tally"
          />

          <TallyAdmin
            userData={userTalimBisoyData}
            emails={emailList}
            title="Talim Bisoy Tally"
          />

          <TallyAdmin
            userData={userSoforBisoyData}
            emails={emailList}
            title="Sofor Bisoy Tally"
          />

          <TallyAdmin
            userData={userDayeData}
            emails={emailList}
            title="Dayee Bisoy Tally"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
