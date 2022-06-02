import 'dart:async';
import 'dart:math';

import 'package:get/get.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class BoxesController extends GetxController {
  final loading = false.obs;
  final latitude = 0.0.obs;
  final longitude = 0.0.obs;

  LatLng _position = LatLng(0, 0);
  List<Marker> _markers = [];

  LatLng destinationPosition = LatLng(-23.302339959846748, -51.2224151225445);

  late GoogleMapController _mapsController;

  static BoxesController get to => Get.find<BoxesController>();

  get mapsController => _mapsController;
  get position => _position;
  get markers => _markers;

  onMapCreated(GoogleMapController gmc) async {
    _mapsController = gmc;
    getPosition();
  }

  Future<Position> _userPosition() async {
    LocationPermission permission;
    bool allowed = await Geolocator.isLocationServiceEnabled();

    if (!allowed) {
      Future.error('Location service disabled.');
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

  double calculateDistance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;
    var a = 0.5 -
        cos((lat2 - lat1) * p) / 2 +
        cos(lat1 * p) * cos(lat2 * p) * (1 - cos((lon2 - lon1) * p)) / 2;
    return 12742 * asin(sqrt(a));
  }

  LatLng pigeonPosition(double fraction, LatLng a, LatLng b) {
    double lat = (b.latitude - a.latitude) * fraction + a.latitude;
    double lng = (b.longitude - a.longitude) * fraction + a.longitude;
    print("NEW POSITION: $lat, $lng");
    return LatLng(lat, lng);
  }

  getPosition() async {
    try {
      loading.value = true;
      final position = await _userPosition();
      latitude.value = position.latitude;
      longitude.value = position.longitude;

      final cameraUpdate =
          CameraUpdate.newLatLng(LatLng(latitude.value, longitude.value));

      _position = LatLng(latitude.value, longitude.value);
      _markers.add(Marker(
        visible: true,
        markerId: const MarkerId('my_mail_box'),
        position: LatLng(latitude.value, longitude.value),
      ));
      _markers.add(Marker(
        visible: true,
        markerId: const MarkerId('destination'),
        position: destinationPosition,
      ));
      print("POSITION: ${this.position}, ${this.destinationPosition}");
      _markers.add(Marker(
        visible: true,
        markerId: const MarkerId('pigeon'),
        position: pigeonPosition(0.9, this.position, this.destinationPosition),
      ));

      print("DISTANCE: " +
          calculateDistance(latitude.value, longitude.value,
                  destinationPosition.latitude, destinationPosition.longitude)
              .toString());
      _mapsController.animateCamera(cameraUpdate);
      loading.value = false;
    } catch (e) {
      print("ERROR");
    }
  }
}
