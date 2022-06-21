import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

import '../style/palette.dart';
import 'map.dart';

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final map = context.watch<MapController>();
    final palette = context.watch<Palette>();

    return Scaffold(
      endDrawer: Drawer(
        backgroundColor: palette.backgroundSettings,
        child: ListView(
          children: <Widget>[
            DrawerHeader(
              decoration: BoxDecoration(
                color: palette.trueWhite,
              ),
              child: Text('Drawer Header'),
            ),
            ListTile(
              title: Text('Item 1'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: Text('Item 2'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
      floatingActionButton: Builder(builder: (context) {
        return FloatingActionButton(
          backgroundColor: palette.redPen,
          child: Icon(Icons.menu_open),
          onPressed: () {
            Scaffold.of(context).openEndDrawer();
          },
        );
      }),
      backgroundColor: palette.background4,
      body: ValueListenableBuilder<Marker>(
        valueListenable: map.carrier,
        builder: (context, center, child) => GoogleMap(
          mapType: MapType.normal,
          zoomControlsEnabled: false,
          zoomGesturesEnabled: false,
          initialCameraPosition: CameraPosition(
            target: map.position.value,
            zoom: 15,
          ),
          onMapCreated: map.onMapCreated,
          markers: Set<Marker>.from([
            ...map.markers.value,
            ...[center]
          ].toList()),
          polylines: Set<Polyline>.from([
            Polyline(
              polylineId: PolylineId('route'),
              visible: true,
              points: [map.position.value, map.destinationPosition],
              color: palette.inkFullOpacity,
              width: 5,
            ),
          ].toList()),
          myLocationEnabled: true,
          myLocationButtonEnabled: false,
        ),
      ),
    );
  }
}
