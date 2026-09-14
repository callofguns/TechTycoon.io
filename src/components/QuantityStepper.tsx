import { NumberStepper } from './NumberStepper';
import { count } from '../lib/format';

interface Props {
  units: number;
  onStep: (delta: number) => void;
}

/** Same control as the price stepper, but for a batch of units instead of dollars. */
export function QuantityStepper({ units, onStep }: Props) {
  return <NumberStepper value={units} onStep={onStep} steps={[500, 100, 10]} format={count} />;
}
