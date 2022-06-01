import 'dart:async';

import 'package:get/get.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class BoxesController extends GetxController {
  final loading = false.obs;
  final latitude = 0.0.obs;
  final longitude = 0.0.obs;
  LatLng _position = LatLng(0, 0);
  late GoogleMapController _mapsController;

  static BoxesController get to => Get.find<BoxesController>();
  get mapsController => _mapsController;
  get position => _position;

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

  getPosition() async {
    try {
      loading.value = true;
      final position = await _userPosition();
      latitude.value = position.latitude;
      longitude.value = position.longitude;

      final cameraUpdate =
          CameraUpdate.newLatLng(LatLng(latitude.value, longitude.value));

      _mapsController.animateCamera(cameraUpdate);
      loading.value = false;
    } catch (e) {
      print("ERROR");
    }
  }
}
