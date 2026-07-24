import { useRef } from 'react'
import { useSearch } from '../context/SearchContext'
import useClickOutside from '../hooks/useClickOutside'
import {
  AREAS,
  VILLA_OWNERSHIP,
  LAND_OWNERSHIP,
  MAX_VILLA_BED,
  VILLA_BED_STEP,
  MAX_VILLA_PRICE_USD,
  VILLA_PRICE_STEP,
  MAX_LAND_SIZE_ARE,
  LAND_SIZE_STEP,
  MAX_LAND_PRICE_IDR,
  LAND_PRICE_STEP,
  formatUsd,
  formatIdr,
} from '../data/searchOptions.js'
import RangeSlider from './search/RangeSlider.jsx'
import FilterChip from './search/FilterChip.jsx'

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

export default function FilterSheet() {
  const {
    sheetOpen,
    sheetClose,
    tab,
    setTab,
    villa,
    setVilla,
    land,
    setLand,
  } = useSearch()
  
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

  const sheetRef = useRef(null)
  useClickOutside(sheetRef, sheetClose, sheetOpen)

  if (!sheetOpen) return null

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

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={sheetRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="text-lg font-bold text-primary">Filters</span>
          <button
            type="button"
            onClick={sheetClose}
            aria-label="Close filters"
            className="rounded p-1 text-primary/60 hover:text-primary"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Tab toggle */}
          <div className="flex rounded-full bg-gray-100 p-1">
            {['villa', 'land'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  tab === t ? 'bg-primary text-white' : 'text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-primary">Name</p>
            <input
              type="text"
              value={state.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder={isVilla ? 'Type villa name...' : 'Type land name...'}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-primary">
              {isVilla ? 'Bedrooms' : 'Size (are)'}
            </p>
            {rangeBody}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-primary">
              Price ({isVilla ? 'USD' : 'IDR'})
            </p>
            {priceBody}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-primary">Area</p>
            <CheckboxList
              options={AREAS}
              selected={state.areas}
              onToggle={(v) => toggleIn('areas', v)}
              suffix=" Area"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-primary">Type</p>
            <CheckboxList
              options={isVilla ? VILLA_OWNERSHIP : LAND_OWNERSHIP}
              selected={state.ownership}
              onToggle={(v) => toggleIn('ownership', v)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          <button type="button" onClick={sheetClose} className="btn-solid w-full">
            {isVilla ? 'Find my villa' : 'Find my land'}
          </button>
        </div>
      </div>
    </div>
  )
}
