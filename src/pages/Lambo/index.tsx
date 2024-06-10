import { Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const lyrics = [
  [
    'Se der står en fyllehund, mine herrer lambo.',
    'Sett nu flasken for din munn, mine herrer lambo.',
    'Se hvordan den dråpen vanker ned ad halsen på den dranker',
    'Lambo, lambo, mine herrer lambo',
  ],
  [
    'Jeg mitt glass utdrukket har, mine herrer lambo.',
    'Se der fins ei dråpen kvar, mine herrer lambo.',
    'Som bevis der på jeg vender, flasken på dens rette ende.',
  ],
  [
    'Lambo, lambo, mine herrer lambo',
    'Hun/han kunne kunsten hun/han var et jævla fyllesvin.',
    'Så går vi til nestemann og ser hva hun/han formår.',
    '(Alternativ: Så går vi til baren og sjenker oss en tår.)'
  ]
]

const Item = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: 'var(--background-color)',
  color: 'var(--color)',
}));


const Lambo: React.FC = () => {
  return (
    <div className="page">
      <Typography variant='h1'>Lambo</Typography>
      <Stack>
        {lyrics.map((verse, i) => (
          <Item key={i}>
            {verse.map(line => (
              <span key={line} style={{ display: 'block' }}>
                {line}
              </span>
            ))}
          </Item>
        ))}
      </Stack>
    </div>
  )
}

export default Lambo