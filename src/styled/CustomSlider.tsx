import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import MuiInput from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import * as React from 'react';

type Props = {
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  hideLabel?: boolean;
};

const Input = styled(MuiInput)`
  width: 42px;
`;

const CustomSlider = ({
  value = 0,
  setValue,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  hideLabel = false,
}: Props) => {
  const handleSliderChange = (event: Event, newValue: number) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = event.target.value === '' ? 0 : Number(event.target.value);

    if (newVal < min) {
      newVal = min;
    } else if (newVal > max) {
      newVal = max;
    }

    setValue(newVal);
  };

  return (
    <Box sx={{ width: 200, paddingInline: 1, paddingBlock: 0 }}>
      {!hideLabel && (
        <Typography id="input-slider" gutterBottom>
          Volume
        </Typography>
      )}
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid size="grow">
          <Slider
            value={value}
            disabled={disabled}
            min={min}
            max={max}
            // valueLabelDisplay="auto"
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid>
          <Input
            disabled={disabled}
            value={value}
            size="small"
            onChange={handleInputChange}
            inputProps={{
              step: step,
              min: min,
              max: max,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomSlider;
