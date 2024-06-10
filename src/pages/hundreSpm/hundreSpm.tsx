import React from 'react';
import { hundreSpmData } from '@/data/hundreSpm/hundreSpmVol1';
import { Box, Typography } from '@mui/material';

const hundreSpm: React.FC = () => {

    const Spm = hundreSpmData.map((e) => {
        return (
            <Typography key={e.nummer}> {e.nummer} {e.spm} </Typography>
        )
    })

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100dvw' }}>
            {hundreSpmData.map((e) => {
                return (
                    <Typography key={e.nummer}> {e.nummer} {e.spm} </Typography>
                )
            })}
        </Box>
    );
};

export default hundreSpm;
