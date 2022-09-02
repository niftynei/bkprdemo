const NODE_ID = "";
const WEBSOCKET_ADDR = "ws://";
const RUNE = "";

async function make_request(method, rune, params) {
	const LNSocket = await lnsocket_init()
	const ln = LNSocket()

	ln.genkey()
	await ln.connect_and_init(NODE_ID, WEBSOCKET_ADDR);

	const {result} = await ln.rpc({ rune, method, params })

	ln.disconnect()
	return result
}

async function rpc_call_method(params) {
	return make_request("bkpr-listaccountevents", RUNE, params)
}

async function go() {
	const res = await rpc_call_method({})

	route_ev = res.events.filter(e => e.tag === 'routed');

	p = {}
	nodes = []
	for (elem of route_ev) {
		if (!nodes.includes(elem.account))
			nodes.push(elem.account);

		if (!p[elem.payment_id]) {
			p[elem.payment_id] = {
				to: '',
				from: '',
				amt: 0,
			};
		}

		payinfo = p[elem.payment_id];

		if (elem.credit_msat > 0) {
			payinfo.from = elem.account;
			payinfo.amt = elem.credit_msat;
		} else
			payinfo.to = elem.account;
	}

	nodes.sort();
	var data = []
	for (n of nodes) {
		var a = []
		for (var i = 0; i < nodes.length; i++)
			a.push(0);
		data.push(a);
	}

	for (payment of Object.values(p)) {
		var from = nodes.indexOf(payment.from);
		var to = nodes.indexOf(payment.to);

		if (from < 0 || to < 0)
			continue;

		data[from][to] += payment.amt;
	}

	const width = 1000;
	const height = 1000;
	const innerRadius = Math.min(width, height) * 0.5 - 90;
	const outerRadius = innerRadius + 10;

	var names = nodes;
	var color = d3.scaleOrdinal(names, d3.quantize(d3.interpolateRainbow, names.length));
	const svg = d3.select("svg")
		.attr("viewBox", [-width / 2, -height / 2, width, height]);

	var chords = d3.chord()
		.padAngle(10 / innerRadius)
		.sortSubgroups(d3.descending)
		.sortChords(d3.descending)
		(data);

	var ribbon = d3.ribbon()
		.radius(innerRadius - 1)
		.padAngle(1 / innerRadius);

	var arc = d3.arc()
		.innerRadius(innerRadius)
		.outerRadius(outerRadius)

	const group = svg.append("g")
		.attr("font-size", "1.2em")
		.attr("font-family", "sans-serif")
		.selectAll("g")
		.data(chords.groups)
		.join("g");

	group.append("path")
		.attr("fill", function (d) {return color(names[d.index])})
		.attr("d", arc);

	group.append("text") 
		.each(function (d) {d.angle = (d.startAngle + d.endAngle) / 2}) 
		.attr("dy", "0.35em") 
		.attr("transform", function (d) {
			var rotate_start = "rotate(";
			var rotation = ((d.angle * 180 / Math.PI - 90).toString());
			var ss = rotate_start.concat(rotation, ")\n",
				"translate(",
				(outerRadius + 20).toString(),
				")",
			);
			return ss;
		}) 
		.attr("text-anchor", function (d) { d.angle > Math.PI ? "end" : null }) 
		.text(d => names[d.index].substr(0,8));

	svg.append("g")
		.attr("fill-opacity", 0.75)
		.selectAll("path")
		.data(chords)
		.join("path")
		  .style("mix-blend-mode", "multiply")
		  .attr("fill", d => color(names[d.target.index]))
		  .attr("d", ribbon)
	    .append("title")
		.text(d => `${names[d.source.index]} -> ${names[d.target.index]} ${d.source.value}`);
}

go()
