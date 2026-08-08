import { useState, useMemo } from "react";
import { calculateFaraid } from "./faraid/engine";
import { HEIRS } from "./faraid/heirs";
import type { FaraidCase, FaraidResult, HeirId } from "./faraid/types";

type HeirCounts = Record<HeirId, number>;

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

const ALL_HEIR_IDS = HEIRS.map((h) => h.id);

function getArabicName(id: HeirId): string {
  return HEIRS.find((h) => h.id === id)?.arabic ?? "";
}

function getDisplayName(id: HeirId): string {
  return HEIRS.find((h) => h.id === id)?.name ?? id;
}

function getGenderIcon(gender: "male" | "female" | undefined): string {
  if (gender === "male") return "♂";
  if (gender === "female") return "♀";
  return "";
}

function getShareTypeBadgeClass(shareType: string): string {
  switch (shareType) {
    case "FARD":
      return "share-type-fard";
    case "ASHABAH":
      return "share-type-ashabah";
    case "FARD_AND_ASHABAH":
      return "share-type-fard-ashabah";
    case "BLOCKED":
      return "share-type-blocked";
    default:
      return "share-type-none";
  }
}

function getShareTypeLabel(shareType: string): string {
  switch (shareType) {
    case "FARD":
      return "Fardh";
    case "ASHABAH":
      return "Ashabah";
    case "FARD_AND_ASHABAH":
      return "Fardh + Ashabah";
    case "BLOCKED":
      return "Terhalang";
    default:
      return "—";
  }
}

export default function App() {
  const [deceasedGender, setDeceasedGender] = useState<"male" | "female">("male");
  const [estate, setEstate] = useState<string>("");
  const [funeralCost, setFuneralCost] = useState<string>("");
  const [debt, setDebt] = useState<string>("");
  const [bequest, setBequest] = useState<string>("");
  const [heirCounts, setHeirCounts] = useState<HeirCounts>({} as HeirCounts);
  const [result, setResult] = useState<FaraidResult | null>(null);

  const totalHeirsSelected = useMemo(
    () => Object.values(heirCounts).reduce((sum, c) => sum + c, 0),
    [heirCounts]
  );

  function updateHeirCount(id: HeirId, delta: number) {
    setHeirCounts((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, Math.min(20, current + delta));
      const updated = { ...prev };
      if (next === 0) {
        delete updated[id];
      } else {
        updated[id] = next;
      }
      return updated;
    });
  }

  function handleCalculate() {
    const estateValue = parseFloat(estate) || 0;
    const funeralValue = parseFloat(funeralCost) || 0;
    const debtValue = parseFloat(debt) || 0;
    const bequestValue = parseFloat(bequest) || 0;

    const netEstate = Math.max(0, estateValue - funeralValue - debtValue - bequestValue);

    const heirs = ALL_HEIR_IDS
      .filter((id) => (heirCounts[id] ?? 0) > 0)
      .map((id) => ({ id, count: heirCounts[id] }));

    if (heirs.length === 0 || estateValue === 0) return;

    const caseData: FaraidCase = {
      deceasedGender,
      estate: netEstate,
      funeralCost: funeralValue,
      debt: debtValue,
      bequest: bequestValue,
      heirs,
    };

    try {
      const res = calculateFaraid(caseData);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan dalam perhitungan. Silakan periksa kembali input Anda.");
    }
  }

  function handleReset() {
    setEstate("");
    setFuneralCost("");
    setDebt("");
    setBequest("");
    setHeirCounts({} as HeirCounts);
    setResult(null);
  }

  function calculatePerHeirAmount(shares: number | undefined, origin: number | null, estate: number): number {
    if (!shares || !origin || origin === 0) return 0;
    return (shares / origin) * estate;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Kalkulator Warisan Islam</h1>
        <p className="arabic-title">حاسبة المواريث الإسلامية</p>
        <p className="subtitle">Hitung pembagian harta faraid dengan mudah</p>
      </header>

      {!result && (
        <>
          <div className="card">
            <div className="card-title">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Jenis Kelamin Almarhum
            </div>
            <div className="gender-toggle">
              <button
                className={`gender-btn ${deceasedGender === "male" ? "active" : ""}`}
                onClick={() => setDeceasedGender("male")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10" cy="14" r="6" />
                  <path d="m19 5-5 5" />
                  <path d="M19 5h-5" />
                  <path d="M14 10v5" />
                </svg>
                Laki-laki
              </button>
              <button
                className={`gender-btn ${deceasedGender === "female" ? "active" : ""}`}
                onClick={() => setDeceasedGender("female")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="9" r="6" />
                  <path d="M12 15v7" />
                  <path d="M9 19h6" />
                </svg>
                Perempuan
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              Harta Warisan
            </div>
            <div className="estate-input-group">
              <div className="estate-input-row">
                <span className="currency-prefix">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={estate}
                  onChange={(e) => setEstate(e.target.value)}
                  min="0"
                />
              </div>
              <div className="estate-deductions">
                <div className="deduction-field">
                  <label>Biaya Pemakaman</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={funeralCost}
                    onChange={(e) => setFuneralCost(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="deduction-field">
                  <label>Utang</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={debt}
                    onChange={(e) => setDebt(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="deduction-field">
                  <label>Wasiat</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={bequest}
                    onChange={(e) => setBequest(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="deduction-field">
                  <label>Harta Bersih</label>
                  <input
                    type="text"
                    readOnly
                    value={formatRupiah(
                      Math.max(
                        0,
                        (parseFloat(estate) || 0) -
                          (parseFloat(funeralCost) || 0) -
                          (parseFloat(debt) || 0) -
                          (parseFloat(bequest) || 0)
                      )
                    )}
                    style={{ fontWeight: 600, color: "var(--primary-700)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Pilih Ahli Waris ({totalHeirsSelected})
            </div>
            <div className="heir-grid">
              {HEIRS.map((heir) => {
                const count = heirCounts[heir.id] ?? 0;
                return (
                  <div key={heir.id} className={`heir-item ${count > 0 ? "active" : ""}`}>
                    <div className="heir-info">
                      <span className="heir-name">
                        {getGenderIcon(heir.gender)} {heir.name}
                      </span>
                      <span className="heir-arabic">{heir.arabic}</span>
                    </div>
                    <div className="count-controls">
                      <button
                        className="count-btn"
                        onClick={() => updateHeirCount(heir.id, -1)}
                        disabled={count === 0}
                      >
                        −
                      </button>
                      <span className="count-display">{count}</span>
                      <button
                        className="count-btn"
                        onClick={() => updateHeirCount(heir.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="calculate-btn"
            onClick={handleCalculate}
            disabled={totalHeirsSelected === 0 || !estate || parseFloat(estate) === 0}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="20" x="4" y="2" rx="2" />
              <line x1="8" x2="16" y1="6" y2="6" />
              <line x1="16" x2="16" y1="14" y2="18" />
              <path d="M16 10h.01" />
              <path d="M12 10h.01" />
              <path d="M8 10h.01" />
              <path d="M12 14h.01" />
              <path d="M8 14h.01" />
              <path d="M12 18h.01" />
              <path d="M8 18h.01" />
            </svg>
            Hitung Pembagian
          </button>
        </>
      )}

      {result && (
        <div className="results-section">
          <div className="card">
            <div className="card-title">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              Hasil Pembagian Warisan
            </div>

            <div className="results-summary">
              <div className="summary-card">
                <div className="label">Harta Bersih</div>
                <div className="value">{formatRupiah(result.caseData.estate)}</div>
              </div>
              <div className="summary-card">
                <div className="label">Asal Masalah</div>
                <div className="value">{result.origin ? formatNumber(result.origin) : "—"}</div>
              </div>
            </div>

            {result.heirs
              .sort((a, b) => {
                const order: Record<string, number> = {
                  FARD_AND_ASHABAH: 0,
                  FARD: 1,
                  ASHABAH: 2,
                  NONE: 3,
                  BLOCKED: 4,
                };
                return (order[a.shareType] ?? 5) - (order[b.shareType] ?? 5);
              })
              .map((heir) => (
                <div
                  key={heir.id}
                  className={`heir-result ${heir.blocked ? "blocked" : ""}`}
                >
                  <div className="heir-result-info">
                    <div className="heir-result-name">
                      {getDisplayName(heir.id)}
                      <span className="heir-result-arabic">{getArabicName(heir.id)}</span>
                      {heir.count > 1 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--neutral-400)" }}>
                          ({heir.count} orang)
                        </span>
                      )}
                      <span className={`share-type-badge ${getShareTypeBadgeClass(heir.shareType)}`}>
                        {getShareTypeLabel(heir.shareType)}
                      </span>
                    </div>
                    {heir.reason && (
                      <div className="heir-result-reason">{heir.reason}</div>
                    )}
                  </div>
                  <div className="heir-result-share">
                    {heir.blocked ? (
                      <div className="share-blocked">Terhalang</div>
                    ) : heir.fraction ? (
                      <>
                        <div className="share-fraction">{heir.fraction}</div>
                        <div className="share-amount">
                          {formatRupiah(
                            calculatePerHeirAmount(
                              heir.shares,
                              result.origin,
                              result.caseData.estate
                            )
                          )}
                        </div>
                        {heir.count > 1 && (
                          <div className="share-amount" style={{ fontSize: "0.7rem" }}>
                            @ {formatRupiah(
                              calculatePerHeirAmount(
                                heir.shares,
                                result.origin,
                                result.caseData.estate
                              ) / heir.count
                            )}
                          </div>
                        )}
                      </>
                    ) : heir.shares && heir.shares > 0 ? (
                      <>
                        <div className="share-fraction">{heir.shares} saham</div>
                        <div className="share-amount">
                          {formatRupiah(
                            calculatePerHeirAmount(
                              heir.shares,
                              result.origin,
                              result.caseData.estate
                            )
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="share-amount">—</div>
                    )}
                  </div>
                </div>
              ))}

            {result.notes.length > 0 && (
              <div className="notes-section">
                <div className="notes-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  Catatan
                </div>
                <ul>
                  {result.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="reset-btn" onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Hitung Ulang
            </button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>Kalkulator Warisan Islam — berdasarkan ilmu Faraid</p>
        <p style={{ marginTop: 4, fontSize: "0.7rem" }}>
          Hasil perhitungan bersifat indikatif. Konsultasikan dengan ahli waris untuk kasus kompleks.
        </p>
      </footer>
    </div>
  );
}
