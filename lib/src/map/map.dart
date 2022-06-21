import 'dart:async';
import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:geolocator/geolocator.dart';

import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapController {
  late Timer timer;
  ValueNotifier<bool> loading = ValueNotifier(false);
  ValueNotifier<double> latitude = ValueNotifier(0.0);
  ValueNotifier<double> longitude = ValueNotifier(0.0);
  ValueNotifier<LatLng> position = ValueNotifier(LatLng(0, 0));
  ValueNotifier<Marker> carrier = ValueNotifier(Marker(
    markerId: MarkerId('position'),
    position: LatLng(0, 0),
    icon: BitmapDescriptor.defaultMarker,
  ));
  ValueNotifier<List<Marker>> markers = ValueNotifier([]);

  LatLng destinationPosition = LatLng(-20.1102715, -42.1619433);

  late GoogleMapController _mapsController;

  void onMapCreated(GoogleMapController gmc) async {
    _mapsController = gmc;
    getPosition();
    SchedulerBinding.instance.addPostFrameCallback((_) {
      rootBundle.loadString("assets/map/map_style.json").then((string) {
        _mapsController.setMapStyle(string);
      });
    });
  }

  void getCarrierPosition() async {
    double distance = calculateDistance(latitude.value, longitude.value,
        destinationPosition.latitude, destinationPosition.longitude);
    double distanceInMeters = distance * 1000;

    DateTime start = DateTime.parse("2022-06-04T18:27:00.000Z");
    DateTime end = DateTime.now();

    Duration difference = end.difference(start);

    int seconds = difference.inSeconds;

    double progress = (seconds * 41.67) / distanceInMeters;

    print(
        'PROG: ${((seconds * 41.67) / 1000).toStringAsFixed(2)} de ${distance.toStringAsFixed(2)}');
    if (progress <= 1) {
      carrier.value = Marker(
        visible: true,
        markerId: const MarkerId('carrier'),
        position: pigeonPosition(progress, position.value, destinationPosition),
      );

      await _mapsController.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: carrier.value.position,
            zoom: 15,
          ),
        ),
      );

      print(
          'PROG: ${((seconds * 41.67) / 1000).toStringAsFixed(2)} de ${distance.toStringAsFixed(2)}');
    } else {
      timer.cancel();
      carrier.value = Marker(
        visible: false,
        markerId: const MarkerId('carrier'),
        position: destinationPosition,
      );
    }
  }

  void getPosition() async {
    try {
      loading.value = true;
      final userPosition = await _userPosition();
      latitude.value = userPosition.latitude;
      longitude.value = userPosition.longitude;

      final cameraUpdate =
          CameraUpdate.newLatLng(LatLng(latitude.value, longitude.value));

      position.value = LatLng(latitude.value, longitude.value);
      markers.value.add(Marker(
        visible: true,
        markerId: const MarkerId('my_mail_box'),
        position: LatLng(latitude.value, longitude.value),
      ));
      markers.value.add(Marker(
        visible: true,
        markerId: const MarkerId('destination'),
        position: destinationPosition,
      ));

      await _mapsController.animateCamera(cameraUpdate);

      timer = Timer.periodic(Duration(seconds: 1), (timer) {
        getCarrierPosition();
      });
      loading.value = false;
    } catch (e) {
      print("ERROR");
    }
  }

  Future<Position> _userPosition() async {
    LocationPermission permission;
    bool allowed = await Geolocator.isLocationServiceEnabled();

    if (!allowed) {
      await Future<Position>.error(
          Exception("Location service is not enabled"));
    }

    permission = await Geolocator.checkPermission();

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse) {
      return await Geolocator.getCurrentPosition();
    }

    return Future.error('Location denied');
  }

  LatLng pigeonPosition(double fraction, LatLng a, LatLng b) {
    double lat = (b.latitude - a.latitude) * fraction + a.latitude;
    double lng = (b.longitude - a.longitude) * fraction + a.longitude;

    return LatLng(lat, lng);
  }

  double calculateDistance(num lat1, num lon1, num lat2, num lon2) {
    var p = 0.017453292519943295;
    var a = 0.5 -
        cos((lat2 - lat1) * p) / 2 +
        cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2;

    return 12742 * asin(sqrt(a));
  }

  Marker createCarrier(double progress) {
    print("CRIANDO");
    var marker = Marker(
      visible: true,
      markerId: const MarkerId('carrier'),
      position: pigeonPosition(progress, position.value, destinationPosition),
    );

    markers.value.add(marker);

    return marker;
  }
}
