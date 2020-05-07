function binIndex(H, S, V) {
    var n_h = 30;
    var n_s = 15;
    var n_v = 15;

    var a = (Math.floor(n_h * H) * n_s * n_v);
    var b = (Math.floor(n_s * S) * n_v);
    var c = Math.floor(n_v * V);

    return a + b + c;

}
