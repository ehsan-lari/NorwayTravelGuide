import { useEffect, useRef } from 'react'
import styles from './NorwayMap.module.css'

// Leaflet is loaded via CDN in index.html
// We access it via window.L

const SEASON_COLORS = {
  perfect:     '#00c9a7',
  good:        '#4dabf7',
  ok:          '#ffd43b',
  challenging: '#ff6b6b',
}

export default function NorwayMap({ recommendations }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return
    const L = window.L

    // Init map once
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [65.5, 14.0],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current
    const L2 = window.L

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (!recommendations || recommendations.length === 0) return

    recommendations.forEach((rec, idx) => {
      const color = SEASON_COLORS[rec.season_match] || '#4dabf7'
      const isTop3 = idx < 3

      // Custom SVG pin marker
      const svgIcon = L2.divIcon({
        className: '',
        html: `
          <div style="
            position: relative;
            width: ${isTop3 ? 40 : 32}px;
            height: ${isTop3 ? 40 : 32}px;
            cursor: pointer;
          ">
            <svg viewBox="0 0 40 40" style="width:100%;height:100%;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5))">
              <circle cx="20" cy="20" r="${isTop3 ? 17 : 14}" fill="${color}" opacity="${isTop3 ? '0.95' : '0.75'}" />
              <circle cx="20" cy="20" r="${isTop3 ? 17 : 14}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
              <text x="20" y="25" text-anchor="middle" fill="${isTop3 ? '#080d18' : '#fff'}"
                font-size="${isTop3 ? '13' : '11'}" font-weight="800" font-family="Inter,sans-serif">
                #${idx + 1}
              </text>
            </svg>
          </div>
        `,
        iconSize: [isTop3 ? 40 : 32, isTop3 ? 40 : 32],
        iconAnchor: [isTop3 ? 20 : 16, isTop3 ? 20 : 16],
        popupAnchor: [0, -(isTop3 ? 22 : 18)],
      })

      const marker = L2.marker([rec.lat, rec.lon], { icon: svgIcon })

      const weatherStr = rec.current_weather?.temp_c != null
        ? `🌡️ ${rec.current_weather.temp_c.toFixed(1)}°C — ${rec.current_weather.description || ''}`
        : ''

      const popup = L2.popup({
        className: 'norway-popup',
        maxWidth: 260,
        closeButton: true,
      }).setContent(`
        <div style="
          background: rgba(13,21,45,0.97);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 14px 16px;
          color: #f0f4ff;
          font-family: Inter, sans-serif;
          min-width: 200px;
        ">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:11px;font-weight:700;background:${color}25;color:${color};
              border:1px solid ${color}50;border-radius:99px;padding:2px 10px;letter-spacing:.08em;text-transform:uppercase">
              #${idx + 1} Match
            </span>
            <span style="font-size:12px;font-weight:800;color:${color}">${rec.match_percentage}%</span>
          </div>
          <div style="font-size:1rem;font-weight:800;margin-bottom:2px">${rec.name}</div>
          <div style="font-size:0.72rem;color:rgba(240,244,255,0.5);margin-bottom:10px">${rec.region}</div>
          <div style="font-size:0.78rem;color:rgba(240,244,255,0.75);line-height:1.5;margin-bottom:8px">
            ${rec.short_description.length > 100 ? rec.short_description.slice(0, 100) + '...' : rec.short_description}
          </div>
          ${weatherStr ? `<div style="font-size:0.75rem;color:rgba(240,244,255,0.55)">${weatherStr}</div>` : ''}
        </div>
      `)

      marker.bindPopup(popup)
      marker.addTo(map)
      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = L2.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 7 })
    }
  }, [recommendations])

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.mapHeader}>
        <h2 className={styles.mapTitle}>🗺️ Your Match Map</h2>
        <div className={styles.mapLegend} aria-label="Map legend">
          <span className={styles.legendItem} style={{ '--dot-color': '#00c9a7' }}>Perfect season</span>
          <span className={styles.legendItem} style={{ '--dot-color': '#4dabf7' }}>Good season</span>
          <span className={styles.legendItem} style={{ '--dot-color': '#ffd43b' }}>OK season</span>
        </div>
      </div>
      <div ref={mapRef} className={styles.map} id="norway-map" aria-label="Interactive map of Norway showing recommended destinations" />
    </div>
  )
}
