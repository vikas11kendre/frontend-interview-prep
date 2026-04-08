import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import {useCallback,useEffect, useState} from 'react';
import CsvFileAnalyser from "@/components/web-worker/csv-file-summary/CsvFileAnalyser";
// import Polling from "@/components/polling/Polling";

export default function Home() {


  return (
    <div
      className={` flex flex-col m-12`}
    >
            <CsvFileAnalyser/>
            {/* <Polling/> */}

      </div>
  );
}
