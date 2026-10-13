import { useState } from 'react';

export default function SearchBar({ initialValue = '', onSearch }) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Job title or company"
        aria-label="Search jobs by title or company"
        className="field"
      />
      <button type="submit" className="btn btn-primary shrink-0">
        Search
      </button>
    </form>
  );
}
