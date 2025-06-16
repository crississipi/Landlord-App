import React from 'react'
import { TenantsPerUnit } from './customcomponents'
import { ChangePageProps } from '@/types'

const TenantList = ({ setPage }:ChangePageProps) => {
  return (
    <div className='primary__btn__holder'>
        <TenantsPerUnit 
            setPage={setPage} 
            unit={101} 
            profile={["/sample_profiles/janwek.png", "/sample_profiles/Johnny-Sins.jpg", "/sample_profiles/kevheart.jpg", "/sample_profiles/john_cena.jpg" ]} 
            name={["John Wick", "Johnny Johnny Yes Papa", "Kevin Heart", "John Cena"]}
            location='Pasay'
        />
        <TenantsPerUnit 
            setPage={setPage} 
            unit={102}
            profile={["/sample_profiles/janwek.png", "/sample_profiles/johnson_dwayne.jpg", "/sample_profiles/kevheart.jpg", "/sample_profiles/john_cena.jpg"]} 
            name={["John Wick", "The Rock", "Kevin Heart", "John Cena"]}
            location='Pasay'
        />
        <TenantsPerUnit 
            setPage={setPage} 
            unit={204} 
            profile={["/sample_profiles/kevheart.jpg", "/sample_profiles/Johnny-Sins.jpg", "/sample_profiles/janwek.png", "/sample_profiles/john_cena.jpg"]} 
            name={["Kevin Heart", "Johnny Johnny Yes Papa", "John Wick", "John Cena"]}
            location='Cavite'
        />
        <TenantsPerUnit 
            setPage={setPage} 
            unit={301} 
            profile={["/sample_profiles/janwek.png", "/sample_profiles/Johnny-Sins.jpg", "/sample_profiles/kevheart.jpg", "/sample_profiles/john_cena.jpg" ]} 
            name={["John Wick", "Johnny Johnny Yes Papa", "Kevin Heart", "John Cena"]}
            location='Paranaque'
        />
        <TenantsPerUnit 
            setPage={setPage} 
            unit={302}
            profile={["/sample_profiles/janwek.png", "/sample_profiles/johnson_dwayne.jpg", "/sample_profiles/kevheart.jpg", "/sample_profiles/john_cena.jpg"]} 
            name={["John Wick", "The Rock", "Kevin Heart", "John Cena"]}
            location='Pasay'
        />
        <TenantsPerUnit 
            setPage={setPage} 
            unit={303} 
            profile={["/sample_profiles/kevheart.jpg", "/sample_profiles/Johnny-Sins.jpg", "/sample_profiles/janwek.png", "/sample_profiles/john_cena.jpg"]} 
            name={["Kevin Heart", "Johnny Johnny Yes Papa", "John Wick", "John Cena"]}
            location='Cavite'
        />
    </div>
  )
}

export default TenantList
