import { NumberStepper } from './NumberStepper';
import { money } from '../lib/format';

interface Props {
  price: number;
  onStep: (delta: number) => void;
}

/** The big price control: coarse and fine adjust buttons around the number. */
export function PriceStepper({ price, onStep }: Props) {
  return <NumberStepper value={price} onStep={onStep} steps={[100, 10, 1]} format={money} />;
}
