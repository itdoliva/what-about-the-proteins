function initCSV(d) {
return ({
    ...d,
    category: 'food',
    carbohydrate: +d.carbohydrate,
    protein: +d.protein,
    lipid: +d.lipid,
    saturatedAcid: +d.saturated_acid,
    unsaturatedAcid: +d.unsaturated_acid,
    saturatedAcidPct: (+d.saturated_acid) / (+d.saturated_acid + +d.unsaturated_acid),
    fiber: +d.fiber,
    cMin: +d.cMin,
    cMax: +d.cMax,
})
}