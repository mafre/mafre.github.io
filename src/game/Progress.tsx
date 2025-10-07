import ResourceDisplay from './ResourceDisplay';

export default function Progress() {
  return (
    <div className="progress">
      <ResourceDisplay resource="ms" label="ms" />
    </div>
  );
}
