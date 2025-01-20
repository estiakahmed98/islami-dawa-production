"use client";

import React, { useState, useEffect, JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { SimpleTreeView, TreeItem as MuiTreeItem } from "@mui/x-tree-view";
import IconButton from "@mui/material/IconButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useSelectedUser } from "@/providers/treeProvider";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ScrollArea } from "./ui/scroll-area";

interface TreeNode {
  id: number;
  label: string;
  user?: string;
  children?: TreeNode[];
}

const OnItemClick: React.FC<{
  loggedInUser: string;
  onItemClick: () => void;
}> = ({ loggedInUser, onItemClick }) => {
  // const [userEmail, setUserEmail] = useState<string>("");
  const { setSelectedUser } = useSelectedUser();
  const [expanded, setExpanded] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const router = useRouter();
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  let idCounter = 1;
  const generateUniqueId = (): number => idCounter++;

  const getFilteredTreeData = (user: string): TreeNode[] => {
    const unions: Record<string, TreeNode> = {
      "moni@gmail.com": {
        id: generateUniqueId(),
        label: "Moni",
        user: "moni@gmail.com",
        children: [
          {
            id: generateUniqueId(),
            label: "Estiak_division",
            user: "estiak@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Toyon_district",
                user: "toyon@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Rifat_upozela",
                    user: "rifat@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Zisan_union",
                        user: "zisan@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Faysal",
                            user: "faysal@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Jewel",
                            user: "jewel@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Tauhid_union",
                        user: "tauhid@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Riyad",
                            user: "riyad@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Nazmul",
                            user: "nazmul@gmail.com",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Akash_upozela",
                    user: "akash@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Sadman_union",
                        user: "zisan@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Ripon",
                            user: "ripon@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Sumon",
                            user: "sumon@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Saurav_union",
                        user: "tauhid@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Taskin",
                            user: "riyad@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Shoriful",
                            user: "nazmul@gmail.com",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Hridoy_district",
                user: "hridoy@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Tamim_upozela",
                    user: "tamim@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Taijul_union",
                        user: "taijul@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Mehedi",
                            user: "mehedi@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Masum",
                            user: "masum@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Ripon_union",
                        user: "ripon@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Amirul",
                            user: "amirul@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Jahidul",
                            user: "jahidul@gmail.com",
                          },
                        ],
                      },
                    ],
                  },

                  {
                    id: generateUniqueId(),
                    label: "Tanzid_upozela",
                    user: "tanzid@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Aftab_union",
                        user: "aftab@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Javed",
                            user: "javed@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Ashraful",
                            user: "ashraful@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Salek_union",
                        user: "salek@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Mehmed",
                            user: "mehmed@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Osman",
                            user: "osman@gmail.com",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: generateUniqueId(),
            label: "Ratul_division",
            user: "ratul@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Pollob_district",
                user: "pollob@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Mezbah_upozela",
                    user: "mezbah@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Imran_union",
                        user: "imran@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Rashid",
                            user: "rashid@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Gurbaz",
                            user: "gurbaz@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Faruque_union",
                        user: "faruque@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Omarzai",
                            user: "omarzai@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Nazibullah",
                            user: "nazibullah@gmail.com",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Raju_upozela",
                    user: "raju@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Babor_union",
                        user: "babor@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Rizwan",
                            user: "rizwan@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Shaheen",
                            user: "shaheen@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Nasim_union",
                        user: "nasim@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Ameer",
                            user: "ameer@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Hasnain",
                            user: "hasnain@gmail.com",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Shakil_district",
                user: "shakil@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Saif_upozela",
                    user: "saif@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Asif_union",
                        user: "asif@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Nahid",
                            user: "nahid@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Hasnat",
                            user: "hasnat@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Mahfuz_union",
                        user: "mahfuz@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Sarjees",
                            user: "sarjees@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Rafi",
                            user: "rafi@gmail.com",
                          },
                        ],
                      },
                    ],
                  },

                  {
                    id: generateUniqueId(),
                    label: "Liton_upozela",
                    user: "liton@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Mughdo_union",
                        user: "mughdo@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Sayeed",
                            user: "sayeed@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Sajeeb",
                            user: "sajeeb@gmail.com",
                          },
                        ],
                      },
                      {
                        id: generateUniqueId(),
                        label: "Shezaan_union",
                        user: "shezaan@gmail.com",
                        children: [
                          {
                            id: generateUniqueId(),
                            label: "Imad",
                            user: "imad@gmail.com",
                          },
                          {
                            id: generateUniqueId(),
                            label: "Naim",
                            user: "naim@gmail.com",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      "estiak@gmail.com": {
        id: generateUniqueId(),
        label: "Estiak",
        children: [
          {
            id: generateUniqueId(),
            label: "Toyon_district",
            user: "toyon@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Rifat_upozela",
                user: "rifat@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Zisan_union",
                    user: "zisan@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Faysal",
                        user: "faysal@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Jewel",
                        user: "jewel@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Tauhid_union",
                    user: "tauhid@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Riyad",
                        user: "riyad@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Nazmul",
                        user: "nazmul@gmail.com",
                      },
                    ],
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Akash_upozela",
                user: "akash@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Sadman_union",
                    user: "zisan@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Ripon",
                        user: "faysal@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Sumon",
                        user: "jewel@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Saurav_union",
                    user: "tauhid@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Taskin",
                        user: "riyad@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Shoriful",
                        user: "nazmul@gmail.com",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: generateUniqueId(),
            label: "Hridoy_district",
            user: "hridoy@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Tamim_upozela",
                user: "tamim@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Taijul_union",
                    user: "taijul@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Mehedi",
                        user: "mehedi@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Masum",
                        user: "masum@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Ripon_union",
                    user: "ripon@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Amirul",
                        user: "amirul@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Jahidul",
                        user: "jahidul@gmail.com",
                      },
                    ],
                  },
                ],
              },

              {
                id: generateUniqueId(),
                label: "Tanzid_upozela",
                user: "tanzid@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Aftab_union",
                    user: "aftab@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Javed",
                        user: "javed@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Ashraful",
                        user: "ashraful@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Salek_union",
                    user: "salek@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Mehmed",
                        user: "mehmed@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Osman",
                        user: "osman@gmail.com",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      "ratul@gmail.com": {
        id: 2,
        label: "Ratul",
        children: [
          {
            id: generateUniqueId(),
            label: "Pollob_district",
            user: "pollob@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Mezbah_upozela",
                user: "mezbah@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Imran_union",
                    user: "imran@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Rashid",
                        user: "rashid@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Gurbaz",
                        user: "gurbaz@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Faruque_union",
                    user: "faruque@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Omarzai",
                        user: "omarzai@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Nazibullah",
                        user: "nazibullah@gmail.com",
                      },
                    ],
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Raju_upozela",
                user: "raju@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Babor_union",
                    user: "babor@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Rizwan",
                        user: "rizwan@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Shaheen",
                        user: "shaheen@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Nasim_union",
                    user: "nasim@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Ameer",
                        user: "ameer@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Hasnain",
                        user: "hasnain@gmail.com",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: generateUniqueId(),
            label: "Shakil_district",
            user: "shakil@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Saif_upozela",
                user: "saif@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Asif_union",
                    user: "asif@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Nahid",
                        user: "nahid@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Hasnat",
                        user: "hasnat@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Mahfuz_union",
                    user: "mahfuz@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Sarjees",
                        user: "sarjees@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Rafi",
                        user: "rafi@gmail.com",
                      },
                    ],
                  },
                ],
              },

              {
                id: generateUniqueId(),
                label: "Liton_upozela",
                user: "liton@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Mughdo_union",
                    user: "mughdo@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Sayeed",
                        user: "sayeed@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Sajeeb",
                        user: "sajeeb@gmail.com",
                      },
                    ],
                  },
                  {
                    id: generateUniqueId(),
                    label: "Shezaan_union",
                    user: "shezaan@gmail.com",
                    children: [
                      {
                        id: generateUniqueId(),
                        label: "Imad",
                        user: "imad@gmail.com",
                      },
                      {
                        id: generateUniqueId(),
                        label: "Naim",
                        user: "naim@gmail.com",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      "toyon@gmail.com": {
        id: 3,
        label: "Toyon",
        user: "toyon@gmail.com",
        children: [
          {
            id: generateUniqueId(),
            label: "Rifat_upozela",
            user: "rifat@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Zisan_union",
                user: "zisan@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Faysal",
                    user: "faysal@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Jewel",
                    user: "jewel@gmail.com",
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Tauhid_union",
                user: "tauhid@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Riyad",
                    user: "riyad@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Nazmul",
                    user: "nazmul@gmail.com",
                  },
                ],
              },
            ],
          },
          {
            id: generateUniqueId(),
            label: "Akash_upozela",
            user: "akash@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Sadman_union",
                user: "sadman@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Ripon",
                    user: "ripon@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Sumon",
                    user: "sumon@gmail.com",
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Saurav_union",
                user: "saurav@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Taskin",
                    user: "taskin@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Shoriful",
                    user: "shoriful@gmail.com",
                  },
                ],
              },
            ],
          },
        ],
      },

      "hridoy@gmail.com": {
        id: 3,
        label: "Hridoy",
        user: "hridoy@gmail.com",
        children: [
          {
            id: generateUniqueId(),
            label: "Tamim_upozela",
            user: "rifat@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Zisan_union",
                user: "zisan@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Faysal",
                    user: "faysal@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Jewel",
                    user: "jewel@gmail.com",
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Tauhid_union",
                user: "tauhid@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Riyad",
                    user: "riyad@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Nazmul",
                    user: "nazmul@gmail.com",
                  },
                ],
              },
            ],
          },

          {
            id: generateUniqueId(),
            label: "Tanzid_upozela",
            user: "tanzid@gmail.com",
            children: [
              {
                id: generateUniqueId(),
                label: "Zisan_union",
                user: "zisan@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Faysal",
                    user: "faysal@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Jewel",
                    user: "jewel@gmail.com",
                  },
                ],
              },
              {
                id: generateUniqueId(),
                label: "Tauhid_union",
                user: "tauhid@gmail.com",
                children: [
                  {
                    id: generateUniqueId(),
                    label: "Riyad",
                    user: "riyad@gmail.com",
                  },
                  {
                    id: generateUniqueId(),
                    label: "Nazmul",
                    user: "nazmul@gmail.com",
                  },
                ],
              },
            ],
          },
        ],
      },

      "rifat@gmail.com": {
        id: 4,
        label: "Rifat",
        user: "rifat@gmail.com",
        children: [
          {
            id: 5,
            label: "Zisan_union",
            user: "zisan@gmail.com",
            children: [
              { id: 6, label: "Faysal", user: "faysal@gmail.com" },
              { id: 7, label: "Jewel", user: "jewel@gmail.com" },
            ],
          },
          {
            id: 8,
            label: "Tauhid_union",
            user: "tauhid@gmail.com",
            children: [
              { id: 9, label: "Riyad", user: "riyad@gmail.com" },
              { id: 10, label: "Nazmul", user: "nazmul@gmail.com" },
            ],
          },
        ],
      },

      "zisan@gmail.com": {
        id: 5,
        label: "Zisan",
        user: "zisan@gmail.com",
        children: [
          { id: 6, label: "Faysal", user: "faysal@gmail.com" },
          { id: 7, label: "Jewel", user: "jewel@gmail.com" },
        ],
      },

      "tauhid@gmail.com": {
        id: 8,
        label: "Tauhid",
        user: "tauhid@gmail.com",
        children: [
          { id: 9, label: "Riyad", user: "riyad@gmail.com" },
          { id: 10, label: "Nazmul", user: "nazmul@gmail.com" },
        ],
      },
    };

    // Return the hierarchical structure based on the logged-in user
    if (user === "moni@gmail.com") {
      return [
        {
          id: 100,
          label: "Central Admin",
          children: [unions["moni@gmail.com"]],
        },
      ];
    } else if (user === "ratul@gmail.com") {
      return [
        {
          id: 101,
          label: "Division Admin",
          children: [unions["ratul@gmail.com"]],
        },
      ];
    } else if (user === "estiak@gmail.com") {
      return [
        {
          id: 102,
          label: "Division Admin",
          children: [unions["estiak@gmail.com"]],
        },
      ];
    } else if (user === "toyon@gmail.com") {
      return [
        {
          id: 103,
          label: "District Admin",
          children: [unions["toyon@gmail.com"]],
        },
      ];
    } else if (user === "hridoy@gmail.com") {
      return [
        {
          id: 104,
          label: "District Admin",
          children: [unions["hridoy@gmail.com"]],
        },
      ];
    } else if (user === "rifat@gmail.com") {
      return [
        {
          id: 105,
          label: "Upozilla Admin",
          children: [unions["rifat@gmail.com"]],
        },
      ];
    } else if (user === "zisan@gmail.com") {
      return [
        {
          id: 106,
          label: "Union Admin",
          children: [unions["zisan@gmail.com"]],
        },
      ];
    } else if (user === "tauhid@gmail.com") {
      return [
        {
          id: 107,
          label: "Union Admin",
          children: [unions["tauhid@gmail.com"]],
        },
      ];
    } else {
      return []; // Return an empty array for unrecognized users
    }
  };

  const treeData = userEmail ? getFilteredTreeData(userEmail) : [];

  const renderTree = (nodes: TreeNode[]): JSX.Element[] | null => {
    if (!nodes || !Array.isArray(nodes)) return null;

    return nodes.map((node) => (
      <MuiTreeItem
        key={node.id}
        itemId={node.id.toString()}
        label={node.label}
        onClick={() => {
          if (node?.user) {
            setSelectedUser(node.user);
            router.push("/admin");
          }
        }}
      >
        {Array.isArray(node.children) && renderTree(node.children)}
      </MuiTreeItem>
    ));
  };

  const getAllIds = (nodes: TreeNode[]): number[] => {
    let ids: number[] = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children) {
        ids = ids.concat(getAllIds(node.children));
      }
    });
    return ids;
  };

  const handleToggle = () => {
    if (isExpanded) {
      setExpanded([]);
    } else {
      const allIds = getAllIds(treeData);
      setExpanded(allIds);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <ScrollArea className="overflow-y-auto text-white font-semibold py-4 shrink-0">
      <Stack spacing={2}>
        <div className="flex justify-end px-4">
          <IconButton size="small" onClick={handleToggle}>
            <p className="text-white text-sm font-medium">
              {isExpanded ? "Collapse All" : "Expand All"}
            </p>
            {isExpanded ? (
              <ArrowDropUpIcon className="text-white" />
            ) : (
              <ArrowDropDownIcon className="text-white" />
            )}
          </IconButton>
        </div>
        <Box sx={{ minHeight: 352, minWidth: 300 }}>
          {userEmail ? (
            <SimpleTreeView
              expandedItems={expanded.map(String)}
              onExpandedItemsChange={(e, ids) =>
                setExpanded(ids as unknown as number[])
              }
            >
              {renderTree(treeData)}
            </SimpleTreeView>
          ) : (
            <p>Please log in to view your tree data.</p>
          )}
        </Box>
      </Stack>
    </ScrollArea>
  );
};

export default OnItemClick;
