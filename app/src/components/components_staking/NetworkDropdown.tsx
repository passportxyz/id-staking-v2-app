import React, { ChangeEvent, useContext, useState} from "react";
import { Button } from "@/components/Button";
import { Menu } from '@headlessui/react';



// Component for the dropdown menu
//  chainConfigs
export const NetworkDropdown = () => {
  return (
    <Menu>
      <Menu.Button>Current network</Menu.Button>
      <Menu.Items>
        {/* {options.map((option, index) => (
          <Menu.Item key={index}>
            {({ active }) => (
              <button className={`${active ? 'bg-blue-500' : ''}`}>{option}</button>
            )}
          </Menu.Item>
        ))} */}
      </Menu.Items>
    </Menu>
  );
};




  