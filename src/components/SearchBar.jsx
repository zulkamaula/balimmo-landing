import { useState } from 'react'
import { useSearch } from '../context/SearchContext.jsx'
import {
  AREAS,
  LAND_OWNERSHIP,
  LAND_PRICE_STEP,
  LAND_SIZE_STEP,
  MAX_LAND_PRICE_IDR,
  MAX_LAND_SIZE_ARE,
  MAX_VILLA_BED,
  MAX_VILLA_PRICE_USD,
  VILLA_BED_STEP,
  VILLA_OWNERSHIP,
  VILLA_PRICE_STEP,
  formatIdr,
  formatUsd,
} from '../data/searchOptions.js'
import FilterChip from './search/FilterChip.jsx'
import RangeSlider from './search/RangeSlider.jsx'

// Small reusable checkbox-list body (shared by desktop popover + mobile sheet).
function CheckboxList({ options, selected, onToggle, suffix = '' }) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 py-1 text-sm text-primary">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
          />
          {opt}
          {suffix}
        </label>
      ))}
    </div>
  )
}

export default function SearchBar({ variant = 'hero' }) {
  // Filter state is shared across instances (hero + docked navbar) via context.
  const { tab, setTab, villa, setVilla, land, setLand, openSheet } = useSearch()
  const [openKey, setOpenKey] = useState(null) // which desktop popover is open (local per instance)

  const isNavbar = variant === 'navbar'
  const isVilla = tab === 'villa'
  const state = isVilla ? villa : land
  const setState = isVilla ? setVilla : setLand
  const fmtPrice = isVilla ? formatUsd : formatIdr

  const patch = (changes) => setState((s) => ({ ...s, ...changes }))
  const toggleIn = (key, value) =>
    setState((s) => ({
      ...s,
      [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value],
    }))

  const toggleChip = (key) => setOpenKey((k) => (k === key ? null : key))
  const closeChip = () => setOpenKey(null)

  // ---- chip value summaries ----
  const nameValue = state.name.trim() || 'Any'
  const bedValue =
    villa.bedMin === 0 && villa.bedMax === MAX_VILLA_BED ? 'Any' : `${villa.bedMin} - ${villa.bedMax}`
  const sizeValue =
    land.sizeMin === 0 && land.sizeMax === MAX_LAND_SIZE_ARE
      ? 'Any'
      : `${land.sizeMin} - ${land.sizeMax} are`
  const priceValue = (() => {
    const maxP = isVilla ? MAX_VILLA_PRICE_USD : MAX_LAND_PRICE_IDR
    if (state.priceMin === 0 && state.priceMax === maxP) return 'Any'
    return `${fmtPrice(state.priceMin)} - ${fmtPrice(state.priceMax)}`
  })()
  const summarize = (arr) => (arr.length === 0 ? 'Any' : arr.length === 1 ? arr[0] : `${arr.length} selected`)

  // ---- filter body renderers (reused in popover + sheet) ----
  const nameBody = (
    <input
      type="text"
      value={state.name}
      onChange={(e) => patch({ name: e.target.value })}
      placeholder={isVilla ? 'Type villa name...' : 'Type land name...'}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-accent"
    />
  )

  const rangeBody = isVilla ? (
    <RangeSlider
      min={0}
      max={MAX_VILLA_BED}
      step={VILLA_BED_STEP}
      valueMin={villa.bedMin}
      valueMax={villa.bedMax}
      onChange={(a, b) => patch({ bedMin: a, bedMax: b })}
      format={(v) => `${v}`}
    />
  ) : (
    <RangeSlider
      min={0}
      max={MAX_LAND_SIZE_ARE}
      step={LAND_SIZE_STEP}
      valueMin={land.sizeMin}
      valueMax={land.sizeMax}
      onChange={(a, b) => patch({ sizeMin: a, sizeMax: b })}
      format={(v) => `${v} are`}
    />
  )

  const priceBody = (
    <RangeSlider
      min={0}
      max={isVilla ? MAX_VILLA_PRICE_USD : MAX_LAND_PRICE_IDR}
      step={isVilla ? VILLA_PRICE_STEP : LAND_PRICE_STEP}
      valueMin={state.priceMin}
      valueMax={state.priceMax}
      onChange={(a, b) => patch({ priceMin: a, priceMax: b })}
      format={fmtPrice}
    />
  )

  const areaBody = (
    <CheckboxList
      options={AREAS}
      selected={state.areas}
      onToggle={(v) => toggleIn('areas', v)}
      suffix=" Area"
    />
  )

  const ownershipBody = (
    <CheckboxList
      options={isVilla ? VILLA_OWNERSHIP : LAND_OWNERSHIP}
      selected={state.ownership}
      onToggle={(v) => toggleIn('ownership', v)}
    />
  )

  const resetRange = () =>
    isVilla
      ? patch({ bedMin: 0, bedMax: MAX_VILLA_BED })
      : patch({ sizeMin: 0, sizeMax: MAX_LAND_SIZE_ARE })
  const resetPrice = () =>
    patch({ priceMin: 0, priceMax: isVilla ? MAX_VILLA_PRICE_USD : MAX_LAND_PRICE_IDR })

  // Static clone: submit is a pure no-op (no navigation, no filtering).
  const handleSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <div
      className={
        isNavbar
          ? 'w-full bg-transparent'
          : 'mx-auto w-full max-w-5xl rounded-2xl bg-transparent'
      }
    >
      <div className={isNavbar ? 'flex items-center gap-3 justify-between' : 'lg:block flex gap-3 justify-between'}>
        {/* Villa / Land segmented toggle */}
        <div
          className={
            isNavbar
              ? 'mb-0 flex justify-center lg:mb-0 lg:shrink-0 lg:justify-start'
              : 'mb-4 flex justify-center lg:justify-start'
          }
        >
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            {['villa', 'land'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t)
                  setOpenKey(null)
                }}
                className={`rounded-full font-semibold capitalize transition-colors ${
                  isNavbar ? 'px-5 py-1.5 text-sm' : 'px-8 py-2 text-sm'
                } ${tab === t ? 'bg-primary text-white' : 'text-primary hover:text-accent'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={isNavbar ? 'flex-1 max-w-xs lg:max-w-full' : 'flex-1 max-w-xs lg:max-w-full'}>
        {/* ===== Desktop: filter-chip bar ===== */}
        <div className="hidden flex-wrap items-stretch gap-2 lg:flex">
          <FilterChip chipKey="name" label="Name" value={nameValue} isOpen={openKey === 'name'} onToggle={toggleChip} onClose={closeChip} onClear={() => patch({ name: '' })}>
            {nameBody}
          </FilterChip>

          <FilterChip
            chipKey="range"
            label={isVilla ? 'Bedrooms' : 'Size (are)'}
            value={isVilla ? bedValue : sizeValue}
            isOpen={openKey === 'range'}
            onToggle={toggleChip}
            onClose={closeChip}
            onClear={resetRange}
            popoverClassName="min-w-[300px]"
          >
            {rangeBody}
          </FilterChip>

          <FilterChip chipKey="price" label="Price" value={priceValue} isOpen={openKey === 'price'} onToggle={toggleChip} onClose={closeChip} onClear={resetPrice} popoverClassName="min-w-[320px]">
            {priceBody}
          </FilterChip>

          <FilterChip chipKey="area" label="Area" value={summarize(state.areas)} isOpen={openKey === 'area'} onToggle={toggleChip} onClose={closeChip} onClear={() => patch({ areas: [] })}>
            {areaBody}
          </FilterChip>

          <FilterChip chipKey="type" label="Type" value={summarize(state.ownership)} isOpen={openKey === 'type'} onToggle={toggleChip} onClose={closeChip} onClear={() => patch({ ownership: [] })}>
            {ownershipBody}
          </FilterChip>

          <button type="submit" className="btn-solid ml-auto shrink-0 px-8">
            {isVilla ? 'Find my villa' : 'Find my land'}
          </button>
        </div>

        {/* ===== Mobile: single Search button opens the filter sheet ===== */}
        <button
          type="button"
          onClick={openSheet}
          className="btn-solid flex w-full items-center justify-center gap-2 lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Search
        </button>
        </form>
      </div>
    </div>
  )
}
