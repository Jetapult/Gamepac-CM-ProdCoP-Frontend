import { FragmentInterpreter } from './FragmentInterpreter';
import { FragmentWeb } from './FragmentWeb';
import { getTemplateId } from '@/lib/templates';

export function FragmentPreview({ result }) {
  if (getTemplateId(result.template) === 'code-interpreter-v1') {
    return <FragmentInterpreter result={result} />;
  }

  return <FragmentWeb result={result} />;
}
