"use client";
import React, { useEffect, useState } from 'react';
import { BarChart, barLabelClasses } from '@mui/x-charts/BarChart';;
import { ChartLandlordProps } from '@/types';
import { pieArcLabelClasses, PieChart } from '@mui/x-charts';

const maintenanceCost = {
    data: [3520, 3300, 200, 5400, 1030, 540],
    label: "Maintenance Cost",
}

const netRevenue = {
    data: [6480, 8700, 8300, 9100, 8970, 6960],
    label: "Net Revenue",
}

const Chart = ({ type }: ChartLandlordProps) => {
  const [currWidth, setWidth] = useState(0);

  const adjustSize = () => { setWidth(window.innerWidth >= 1024 ? 12 : 16) };
  window.addEventListener("onload", adjustSize);
  useEffect(() => {
    adjustSize();
    window.addEventListener("resize", adjustSize);
  }, []);

  return (
    <div className='h-[176px] md:h-[224px] w-full lg:h-40'>
        { type === "bar" && (
            <BarChart
                sx={{
                    [`.${barLabelClasses.root}`] : {
                    fill: 'white',
                    fontSize: 12
                    }
                }}
                yAxis={[{
                    domainLimit: 'strict',
                }]}

                xAxis={[{ 
                    scaleType: 'band', 
                    data: ["OCT", "NOV", "DEC", "JAN", "FEB", "MAR"],
                    tickLabelStyle: {
                        fontSize: 13,
                        marginTop: "-50px",
                        fill: "#574964"
                    },
                    labelStyle: {
                        color: "#ffffff"
                    },
                }]}        
                slotProps={{ legend: { hidden: true } }}        
                series={[
                    { ...netRevenue, stack: 'total', color: "#574964"},
                    { ...maintenanceCost, stack: 'total', color: "#c70036"},
                ]}        
                leftAxis={null}
                bottomAxis={{
                    disableLine: true,
                    disableTicks: true,
                }}
                barLabel="value"
                margin={{ left: 10, right: 10, top: 0, bottom: 20 }}
            />
        )}
        { type === "pie" && (
            <PieChart
            sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fontSize: currWidth,
                  fill: 'white',
                },
            }}
            series={[
              {
                data: [
                  { id: 1, value: 13990, color: '#c70036', label: 'Maintenance Cost'},
                  { id: 0, value: 48510, color: '#574964', label: 'Net Revenue'},
                ],
                arcLabel: 'value',
                arcLabelRadius: '55%',
                arcLabelMinAngle: 50
              },
            ]}
            slotProps={{ legend: { hidden: true } }}  
            margin={{ left: 10, right: 10, top: 0, bottom: 10 }}
          />
        )}
    </div>
  )
}

export default Chart
