/*
 * LightningChart JS example showcasing visualization of LiDAR scanned 3D typography
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Extract required parts from LightningChartJS.
const { lightningChart, PointSeriesTypes3D, PointStyle3D, ColorRGBA, PalettedFill, LUT, AxisTickStrategies, emptyLine, emptyFill, Themes } =
    lcjs

// Create 3D chart
const chart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .Chart3D({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle(`LiDAR Point Cloud`)

chart
    .getDefaultAxisX()
    .setTickStrategy(AxisTickStrategies.Numeric, (ticks) =>
        ticks
            .setMajorTickStyle((major) => major.setLabelFillStyle(emptyFill))
            .setMinorTickStyle((minor) => minor.setLabelFillStyle(emptyFill)),
    )
    .setStrokeStyle(emptyLine)
chart
    .getDefaultAxisY()
    .setTickStrategy(AxisTickStrategies.Numeric, (ticks) =>
        ticks
            .setMajorTickStyle((major) => major.setLabelFillStyle(emptyFill))
            .setMinorTickStyle((minor) => minor.setLabelFillStyle(emptyFill)),
    )
    .setStrokeStyle(emptyLine)
    .setInterval({ start: -111, end: 2500 })
chart
    .getDefaultAxisZ()
    .setTickStrategy(AxisTickStrategies.Numeric, (ticks) =>
        ticks
            .setMajorTickStyle((major) => major.setLabelFillStyle(emptyFill))
            .setMinorTickStyle((minor) => minor.setLabelFillStyle(emptyFill)),
    )
    .setStrokeStyle(emptyLine)

const legend = chart.addLegendBox()

let totalPointsCount = 0

const loadBinaryLidarFile = async (assetName) => {
    // Load LiDAR data as custom formatted binary file (contains total number of data points + each point X, Y, Z values)
    const result = await fetch(
        new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + `examples/assets/0911/${assetName}`,
    )
    const blob = await result.blob()
    const arrayBuffer = await blob.arrayBuffer()
    // Read number of points as first Uint32 value.
    let arrayBufferBytePos = 0
    const pointsCount = new Uint32Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + 4))[0]
    arrayBufferBytePos += 4
    // Read binary data into XYZRGB points.
    const dataPoints = new Array(pointsCount).fill(0).map((_) => ({}))
    // X values in order.
    const xValuesByteLength = pointsCount * 2
    const xValues = new Int16Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + xValuesByteLength))
    arrayBufferBytePos += xValuesByteLength
    xValues.forEach((x, i) => (dataPoints[i].x = x))
    // Y values in order.
    const yValuesByteLength = pointsCount * 2
    const yValues = new Int16Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + yValuesByteLength))
    arrayBufferBytePos += yValuesByteLength
    yValues.forEach((y, i) => (dataPoints[i].y = y))
    // Z values in order.
    const zValuesByteLength = pointsCount * 2
    const zValues = new Int16Array(arrayBuffer.slice(arrayBufferBytePos, arrayBufferBytePos + zValuesByteLength))
    arrayBufferBytePos += zValuesByteLength
    zValues.forEach((z, i) => (dataPoints[i].z = z))

    // Add Point Series with lidar point cloud data.
    const series = chart
        .addPointSeries({
            type: PointSeriesTypes3D.Pixelated,
            individualPointColorEnabled: true,
        })
        .add(dataPoints)
        .setPointStyle(
            new PointStyle3D.Pixelated({
                fillStyle: new PalettedFill({
                    lookUpProperty: 'y',
                    lut: new LUT({
                        units: 'Elevation (m)',
                        interpolate: false,
                        steps: [
                            { value: -100, color: ColorRGBA(30, 144, 255) },
                            { value: 0, color: ColorRGBA(49, 201, 60) },
                            { value: 200, color: ColorRGBA(255, 87, 0) },
                            { value: 400, color: ColorRGBA(202, 22, 80) },
                            { value: 600, color: ColorRGBA(148, 18, 18) },
                            { value: 800, color: ColorRGBA(178, 0, 255) },
                            { value: 1000, color: ColorRGBA(225, 122, 239) },
                        ],
                    }),
                }),
                size: 1,
            }),
        )

    legend.add(series)

    totalPointsCount += pointsCount
    chart.setTitle(`LiDAR Point Cloud | ${totalPointsCount} data points`)

    return series
}

loadBinaryLidarFile('NEWLAND.bin').then((series) => {
    series.setName('Badwater Basin')
})
